/* eslint-disable prefer-destructuring */
import React, { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import printPdf from 'mapbox-print-pdf';

import { stateAbbrevToZoomLevel, DATA_MODES } from '../../../../constants';

import {
  separatePascalCase,
} from '../../../../utils';

import './style.scss';

const thresholds = ['0-100', '101-500', '501-1000', '1001-5000', '5001-10000', '>10000'];
const colors = ['#86CCFF', '#FFC148', '#FFA370', '#FF525C', '#CB4767', '#6B1B38'];

const MAP_SOURCES = {
  COUNTY: {
    type: 'vector',
    url: 'mapbox://pine-beetle-prediction.1be58pyi',
  },
  RANGER_DISTRICT: {
    type: 'vector',
    url: 'mapbox://pine-beetle-prediction.0tor8eeq',
  },
};

const SOURCE_LAYERS = {
  COUNTY: 'US_Counties_updated',
  RANGER_DISTRICT: 'RD_SPB_NE',
};

const MAP_SOURCE_NAME = 'counties';
const VECTOR_LAYER = 'prediction-chloropleth-layer';

const HistoricalMap = (props) => {
  const {
    allRangerDistricts,
    dataMode,
    endYear,
    selectedState,
    setCounty,
    setRangerDistrict,
    setState,
    startYear,
    trappingData,
    year,
  } = props;

  const [map, setMap] = useState();
  const [initialFill, setInitialFill] = useState(false);
  const [legendTags, setLegendTags] = useState([]);
  const [trappingHover, setTrappingHover] = useState(null);
  const [isDownloadingMap, setIsDownloadingMap] = useState(false);

  // twice-curried function for generating hover callback
  const createMapHoverCallback = (trappings, rangerDistricts, mode) => (e) => {
    if (!map) return;

    const counties = map.queryRenderedFeatures(e.point, {
      layers: [VECTOR_LAYER],
    });

    if (counties.length > 0 && counties[0] && counties[0].properties && counties[0].properties.forest) {
      const { x, y } = e.point;

      let location;

      if (mode === DATA_MODES.COUNTY) {
        location = counties[0].properties.forest.slice(0, -3);
      } else {
        location = rangerDistricts.find(rd => rd.includes(counties[0].properties.forest.replaceAll(' ', '')));
      }

      const data = trappings.filter((p) => {
        return (p.county === location && mode === DATA_MODES.COUNTY)
        || (p.rangerDistrict === location && mode === DATA_MODES.RANGER_DISTRICT);
      });

      if (data && data.length > 0 && x && y) {
        const countyName = data.find(t => t.county) ? data.find(t => t.county).county : '';

        const averageSpots = data.reduce((acc, curr) => (acc + curr.spots), 0) / data.length;
        const avgSpbPer2Weeks = data.reduce((acc, curr) => (acc + curr.spbPer2Weeks), 0) / data.length;
        const avgCleridsPer2Weeks = data.reduce((acc, curr) => (acc + curr.cleridPer2Weeks), 0) / data.length;

        setTrappingHover((
          <div id="trapping-hover" style={{ left: `${x}px`, top: `${y - 125}px` }}>
            <h3>{dataMode === DATA_MODES.COUNTY ? `${countyName} County` : `${counties[0].properties.forest.slice(0, -3)} Ranger District`}</h3>
            <p>Average Spots: {averageSpots.toFixed(2)}</p>
            <p>Average SPB Per 2 Weeks: {avgSpbPer2Weeks.toFixed(2)}</p>
            <p>Average Clerids Per 2 Weeks: {avgCleridsPer2Weeks.toFixed(2)}</p>
          </div>
        ));
      } else {
        setTrappingHover(null);
      }
    }
  };

  // twice-curried function for generating click callback
  const createMapClickCallback = rangerDistricts => (e) => {
    const {
      forest: _forest,
      STATE: _state,
    } = e.features[0].properties;

    const forest = _forest.slice(0, -3);

    if (!selectedState) {
      setState(_state);
    } else if (dataMode === DATA_MODES.COUNTY) {
      setCounty(forest);
    } else {
      setRangerDistrict(rangerDistricts.find(district => (
        district.includes(forest.replace(' ', ''))
      )));
    }
  };

  const generateMap = (forceRegenerate) => {
    if (map && !forceRegenerate) return;

    const createdMap = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/pine-beetle-prediction/ckgrzijos0q5119paazko291z',
      center: [-84.3880, 33.7490], // starting position
      zoom: 4.8, // starting zoom
      options: {
        trackResize: true,
      },
    });

    if (!createdMap._controls) return;

    // if we haven't added a navigation control, add one
    if (createdMap._controls.length < 2) {
      createdMap.addControl(new mapboxgl.NavigationControl());
    }

    // disable map zoom when using scroll
    createdMap.scrollZoom.disable();

    const legendTagsToSet = thresholds.map((threshold, index) => {
      const color = colors[index];

      return (
        <div key={color}>
          <span>{threshold}</span>
          <span className="legend-key" style={{ backgroundColor: color }} />
        </div>
      );
    });

    // add legend tags
    setLegendTags(legendTagsToSet);

    // add map source on load
    if (!createdMap._listeners.load) {
      createdMap.on('load', () => {
        if (!createdMap.getSource(MAP_SOURCE_NAME)) {
          createdMap.addSource(MAP_SOURCE_NAME, dataMode === DATA_MODES.COUNTY ? MAP_SOURCES.COUNTY : MAP_SOURCES.RANGER_DISTRICT);
        }
      });
    }

    // select county/RD when user clicks on it
    if (!createdMap._listeners.click) {
      createdMap.on('click', VECTOR_LAYER, createMapClickCallback(allRangerDistricts));
    }

    if (createdMap._listeners.mousemove === undefined) {
      createdMap.on('mousemove', createMapHoverCallback(trappingData, allRangerDistricts, dataMode));
    }

    setMap(createdMap);
  };

  const colorFill = (trappings) => {
    // keep trying until map styles are loaded
    if (!map.isStyleLoaded()) {
      setTimeout(() => {
        colorFill(trappings);
      }, 1000);

      return;
    }

    // remove county layer if already constructed
    if (map.getLayer(VECTOR_LAYER)) {
      map.removeLayer(VECTOR_LAYER);
    }

    const fillExpression = ['match', ['upcase', ['get', 'forest']]];
    const strokeExpression = ['match', ['upcase', ['get', 'forest']]];

    const trappingsByLocality = trappings.reduce((acc, curr) => {
      const {
        county,
        rangerDistrict,
        state,
        spots,
      } = curr;

      const countyFormatName = `${county} ${state}`.toUpperCase();
      const rangerDistrictFormatName = rangerDistrict ? separatePascalCase(rangerDistrict.split('_').pop()).toUpperCase() : '';

      const localityDescription = dataMode === DATA_MODES.COUNTY ? countyFormatName : rangerDistrictFormatName;

      return {
        ...acc,
        [localityDescription]: {
          sum: ((acc[localityDescription] && acc[localityDescription].sum) || 0) + spots,
          numEntries: ((acc[localityDescription] && acc[localityDescription].numEntries) || 0) + 1,
        },
      };
    }, {});

    Object.entries(trappingsByLocality).forEach(([localityDescription, spotData]) => {
      const spots = spotData.sum / spotData.numEntries;

      let color;

      if (spots <= 100) {
        color = colors[0];
      } else if (spots > 100 && spots <= 500) {
        color = colors[1];
      } else if (spots > 500 && spots <= 1000) {
        color = colors[2];
      } else if (spots > 1000 && spots <= 5000) {
        color = colors[3];
      } else if (spots > 5000 && spots <= 10000) {
        color = colors[4];
      } else {
        color = colors[5];
      }

      fillExpression.push(localityDescription, color);
      strokeExpression.push(localityDescription, '#000000');
    });

    // last value is the default, used where there is no data
    fillExpression.push('rgba(0,0,0,0)');
    strokeExpression.push('rgba(0,0,0,0)');

    // add layer from the vector tile source with data-driven style
    map.addLayer({
      id: VECTOR_LAYER,
      type: 'fill',
      source: MAP_SOURCE_NAME,
      'source-layer': dataMode === DATA_MODES.COUNTY ? SOURCE_LAYERS.COUNTY : SOURCE_LAYERS.RANGER_DISTRICT,
      paint: {
        'fill-color': fillExpression,
        'fill-outline-color': strokeExpression,
      },
    }, 'water-point-label');
  };

  // adopted from old site
  // Creates and returns HTML with the title for the header
  // of the downloaded maps. This object is used by the mapbox-print-pdf library.
  const buildHeader = () => {
    return (
      `<div id="map-header" style="text-align: center;">
          <h2 style="letter-spacing: 1px;margin-top: 200px;margin-bottom: 50px;">Total Number of Spots</h2>
        </div>`
    );
  };

  // adopted from old site
  // Creates and returns HTML with information for the footer
  // of the downloaded maps. This includes a legend for the color scale,
  // notes explaining the legend and sources, and information about the
  // data collection process. This object is used by the mapbox-print-pdf library.
  const buildFooter = () => {
    const title = `Southern Pine Beetle Outbreak Spot Maps: ${selectedState} ${startYear}-${endYear}`;

    // creates the color boxes and text fields for the legend in the footer
    const legendString = thresholds.reduce((acc, curr, index) => {
      const layer = curr;
      const color = colors[index];
      const spanString = `
          <div class="footer-legend-key" style="font-family: 'Open Sans', arial, serif;background: ${color};display: 
          inline-block;border-radius: 20%;width: 20px;height: 20px;margin-right: 5px;margin-left: 5px;"></div><span>${layer}</span>`;
      return acc.concat(spanString);
    }, '');

    return (
      `
          <div id="map-footer" style="text-align: center;letter-spacing: 1px;margin-top: 20px;margin-bottom: 0;">
              <p class="footnote" style="font-family: 'Open Sans', arial, serif;color: #898989;line-height: 
              14px;width: 53%;margin: auto;margin-bottom: 16px;font-size: 14px;">Average spots per year:</p>
              <div id="footer-legend" style="font-family: 'Open Sans', arial, serif;width: 51%;margin: auto;margin-bottom: 10px;">
                  ${legendString}
              </div>
              <div id="spacer" style="height: 50px;"></div>
              <h2 style="font-family: 'Open Sans', arial, serif;margin-bottom: 16px;margin-top: 16px;">${title}</h2>
              <p style="font-family: 'Open Sans', arial, serif;font-size: 14px;margin-bottom: 16px;">
              The SPB prediction project is supported by USDA Forest Service: Science and Technology 
              Development Program (STDP)
              </p>
              <p style="font-family: 'Open Sans', arial, serif;font-size: 14px;margin-bottom: 16px;">Contact: Matthew P. Ayres - matthew.p.ayres@dartmouth.edu; Carissa F. Aoki - caoki@bates.edu
              </p>
              <p class="footnote" style="font-family: 'Open Sans', arial, serif;color: #898989;line-height: 14px;width: 53%;
              margin: auto;margin-bottom: 16px;font-size: 14px;">Sources: Esri, HERE, Garmin, Intermap, increment P Corp., GEBCO, USGS,FAO, NPS, NRCAN, 
              GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), swisstopo, © OpenStreetMap 
              contributors, andthe GIS User Community</p>
          </div>
          `
    );
  };

  const downloadMap = () => {
    if (!map || !year || isDownloadingMap) return;

    setIsDownloadingMap(true);

    const mapName = `${selectedState || 'All States'}-${year}.pdf`;

    printPdf.build()
      .header({
        html: buildHeader(),
        baseline: { format: 'a3', orientation: 'p' },
      })
      .footer({
        html: buildFooter(),
        baseline: { format: 'a3', orientation: 'p' },
      })
      .margins({
        top: 8,
        right: 8,
        left: 8,
        bottom: 8,
      }, 'pt')
      .format('a3')
      .portrait()
      .print(map, mapboxgl)
      .then((pdf) => {
        pdf.save(mapName);
        setIsDownloadingMap(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;

    setTimeout(() => {
      setMap(undefined);
      generateMap(true);

      // Calls function to download map when download control is clicked
      document.addEventListener('click', (event) => {
        if (!event.target.matches('.download-button')) return;
        downloadMap();
      }, false);

      // Calls function to download map when download control is clicked
      document.addEventListener('click', (event) => {
        if (!event.target.matches('.download-button p')) return;
        downloadMap();
      }, false);
    }, 100);
  }, [dataMode]);

  useEffect(() => {
    if (!map) return;

    if (year.toString().length === 4) colorFill(trappingData);

    if (selectedState) {
      const zoom = stateAbbrevToZoomLevel[selectedState];

      map.flyTo({
        center: zoom[0],
        zoom: zoom[1],
      });
    } else {
      map.flyTo({
        center: [-84.3880, 33.7490],
        zoom: 4.8,
      });
    }
  }, [trappingData, selectedState, map]);

  useEffect(() => {
    if (!initialFill && map && trappingData.length > 0) {
      colorFill(trappingData);
      setInitialFill(true);
    }

    if (map && trappingData) {
      map.on('mousemove', createMapHoverCallback(trappingData, allRangerDistricts, dataMode));
    }
  }, [map, trappingData, allRangerDistricts, dataMode]);

  useEffect(() => {
    if (map && allRangerDistricts) {
      map.on('click', VECTOR_LAYER, createMapClickCallback(allRangerDistricts));
    }
  }, [map, allRangerDistricts]);

  return (
    <div className="flex-item-left" id="map-container">
      <div id="map" />
      <div id="map-overlay-download" onClick={downloadMap}>
        <h4>{isDownloadingMap ? 'Downloading...' : 'Download'}</h4>
      </div>
      <div className="map-overlay-legend" id="legend">
        <div className="legend-key-title"><strong>Average spots per year</strong></div>
        {legendTags}
      </div>
      {trappingHover}
    </div>
  );
};

export default HistoricalMap;
