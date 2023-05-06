import * as React from 'react';
import * as moment from 'moment';
import axios from 'axios';
import Chart, { Series, smooth } from './Chart';
import { Menu, MenuDivider, MenuItem, Popover } from '@blueprintjs/core';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { getPetrolStatisticsNorway } from './ssbno';
import worker from './worker.js';
import WebWorker from './workerSetup';
import scurveFit from './s-curve-regression';
import { Button } from '@blueprintjs/core';
import SelectCountries from './SelectCountries';
import Pyramid from './Pyramid';

const segments = [
  { text: 'Models', id: 'model' },
  { text: 'Brands', id: 'brand' },
  { text: 'Manafacturers', id: 'manafacturer' },
  { text: 'Segments', id: 'segment' },
  { text: 'Segments Pyramid', id: 'pyramid' },
  { text: 'Fuel', id: 'fuel' },
];

const smoothing = [
  { text: 'Month', value: 1 },
  { text: 'Quarter', value: 3 },
  { text: 'Half Year', value: 6 },
  { text: 'Year', value: 12 },
  { text: 'Two Years', value: 24 },
  { text: 'Cumulative', value: NaN },
];

const fitTypes = [
  { value: 'linear', text: 'Linear' },
  { value: 'exponential', text: 'Exponential' },
  { value: 'scurve', text: 'S Curve' },
];

function fetchPage(page: any, delay: number, std: number = 3000, sheet: string = '1l50qi3FAue2zqMOtc-vdGbXBWpb0I4lKByqUaz2nuFs')
  : Promise<any> {
  const key = 'AIzaSyC8N3IAsa8l-D_bEQbEM1G8-ZVhkzWMpKM'
  return new Promise(resolve => setTimeout(() => resolve(
    axios.get(
      // 'https://spreadsheets.google.com/feeds/list/1l50qi3FAue2zqMOtc-vdGbXBWpb0I4lKByqUaz2nuFs/'
      'https://sheets.googleapis.com/v4/spreadsheets/' + sheet + '/values/'
      + page
      + '?alt=json&key=' + key
    )
  ), delay + std * Math.random()))
}

export function findLastIndex<T>(array: Array<T>, predicate: (value: T, index: number, obj: T[]) => boolean): number {
  let l = array.length;
  while (l--) {
    if (predicate(array[l], l, array)) {
      return l;
    }
  }
  return -1;
}

export function mapSeriesUnion(group: string[], countries: Record<string, Series[]>) {
  return group
    .map(g => countries[g])
    .filter(s => s)
    .reduce((agg, s) => {
      s.forEach(model => {
        const aggModel = agg.find(am => am.label === model.label);
        
        if (aggModel) {
          const data = aggModel.data
            .concat(model.data)
            .sort((a, b) => a.t.diff(b.t))
            .reduce((aggData, m) => {
              if (aggData.length === 0) {
                aggData.push(m);
              } else if (aggData[aggData.length - 1].t.isSame(m.t)) {
                const d = aggData[aggData.length - 1];
                aggData[aggData.length - 1] = { t: d.t, y: d.y + m.y };
              } else {
                aggData.push(m);
              }
              return aggData;
            }, [] as { t: moment.Moment, y: number }[])

          aggModel.data = data;
        } else {
          agg.push({ label: model.label, data: model.data.map(d => ({ ...d }))});
        }
      })
      
      return agg;
    }, [])
    ;
}

export function mapSeriesCut(group: string[], countries: Record<string, Series[]>) {
  return group
    .map(g => countries[g])
    .filter(c => c)
    .reduce((agg, cuntry) => {
      cuntry.forEach(model => {
        const aggModel = agg.find(am => am.label === model.label);
        
        if (aggModel) {
          const data = aggModel.data
            // .concat(model.data)
            // .sort((a, b) => a.t.diff(b.t))
            .reduce((aggData, d1) => {
              const d2 = model.data.find(dd2 => dd2.t.isSame(d1.t));

              if (d2) {
                aggData.push({ t: d1.t, y: d1.y + d2.y });
              }

              return aggData;
            }, [] as { t: moment.Moment, y: number }[])

          aggModel.data = data;
        } else {
          agg.push({ label: model.label, data: model.data.map(d => ({ ...d }))});
        }
      })
      
      return agg;
    }, [])
    ;
}

export function groupBy(xs: any, key: string | number) {
  const object = xs.reduce(function(rv: any, x: any) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});

  // Make into an array
  const arr = [];
  for (const value of Object.keys(object)) {
    if (object.hasOwnProperty((value))) {
      arr.push([value, object[value]]);
    }
  }

  return arr;
}

export const convertArrayToObject = (array: any[], key: string | number) => {
  const initialValue = {};
  return array.reduce((obj, item) => {
    return {
      ...obj,
      [item[key]]: item,
    };
  }, initialValue);
};

interface MainProps {
}

interface State {
  group: string[],
  segment: string,
  smooth: number,
  fitType: string,
  fitItem: string,
  sCurveParams: { a: number, b: number, c: number },
  manufacturer: { model: string, brand?: string, manufacturer?: string } [],
  countries:    Record<string, Series[]>,
  countriesFuel: Record<string, Series[]>,
}

export class Main extends React.Component<MainProps, State> {
    
  state: State = {
    group: ['sweden'],
    segment: 'segment',
    smooth: 12,
    fitType: 'linear',
    fitItem: '',
    sCurveParams: { a: 5000, b: 1000, c: 0.5 },
    manufacturer: [],
    countries:    {},
    countriesFuel: {},
  };

  worker: any;

  constructor(props: MainProps) {
    super(props);

    getPetrolStatisticsNorway().then(petrolSeries => {
      // console.log('data', data);
      this.setState(({ countriesFuel }) => ({
        countriesFuel: { ...countriesFuel, norway: petrolSeries },
      }));
    });

    axios.get('swedenfuel.json')
      .then(r => r.data as Series[])
      .then(petrolSeries => {
        // console.log('data', data);
        this.setState(({ countriesFuel }) => ({
          countriesFuel: { ...countriesFuel, sweden: petrolSeries },
        }));
      });

    [
      {
        countryId: 'NLD',
        name: 'netherlands',
      },
      {
        countryId: 'DEU',
        name: 'germany',
      },
      {
        countryId: 'FRA',
        name: 'france',
      },
      {
        countryId: 'DNK',
        name: 'denmark',
      },
    ].forEach(({ countryId, name }) => {
      const totalReq = ['INTL.5-2', 'INTL.62-2', 'INTL.65-2', 'INTL.63-2']
        .map(id => `${id}-${countryId}-TBPD.A`)
        .join(';')

      axios.get(`https://api.eia.gov/series/?api_key=TsVtImL6otz3dyW4hKcias01zxPnVymkRSvDq8B2&series_id=${totalReq}`)
        .then(response => response.data.series)
        .then((response: { name: string, data: [string, number][] }[] ) => {
          console.log('response', response);
          const series = response.map(s => ({
            label: s.name.split(',')[0],
            data: s.data
              .reverse()
              .filter(d => typeof d[1] === 'number')
              .map(d => ({ t: moment(d[0], 'YYYY'), y: d[1] }))
              .map(d => Array(12).fill(0).map((_, i) => ({ t: moment(d.t).add(i, 'M'), y: d.y })))
              .reduce((agg, con) => agg.concat(con)),
          }));

          console.log('netherlands', series);
          this.setState(({ countriesFuel }) => ({
            countriesFuel: { ...countriesFuel, [name]: series },
          }));
        })
        .catch(error => {
          console.error(countryId, name, error);
        })
    });

    // getNorwayMotorGas().then((swedenGas: Series[]) => this.setState(({ countriesFuel }) => ({
    //   countriesFuel: { ...countriesFuel, sweden: swedenGas },
    // })));

    // axios.get('https://api.spbi.se/api/v1/products-volumes-filter?groupBy=month&perCubicMeter=false&id=5,18,8')
    //   .then(response => response.data as { name: string, data: { date: string, value: number }[] }[] )
    //   .then(series => series
    //     .map(s => ({
    //       label: s.name,
    //       data: s.data
    //         .map(d => ({ t: moment(d.date), y: d.value / 1000 }))
    //         .filter(d => d.t.isAfter('2015-01-01'))
    //         .filter(d => d.y > 0)
    //     })
    //     // TODO Combine diffrent disel groups
    //     // .reduce((out, s) => )
    //   ))
    //   .then((swedenGas: Series[]) => this.setState(({ countriesFuel }) => ({
    //     countriesFuel: { ...countriesFuel, sweden: swedenGas },
    //   })));

    // axios.get('norway.json')
    //   .then(reponse => reponse.data)
    //   .then(norway => this.setState({ norway }));

    // axios.get('netherlands.json')
    //   .then(reponse => reponse.data)
    //   .then(netherlands => this.setState({ netherlands }));

    // axios.get('spain.json')
    //   .then(reponse => reponse.data)
    //   .then(spain => this.setState({ spain }));

    [
      { page: 2, id: 'sweden'},
      { page: 3, id: 'germany'},
      { page: 4, id: 'norway'},
      { page: 5, id: 'finland'},
      // { page: 6, id: 'france'},
      { page: 7, id: 'denmark'},
      { page: 8, id: 'netherlands'},
      { page: 9, id: 'spain'},
      { page: 10, id: 'schweiz'},
      { page: 11, id: 'ireland'},
      // { page: 12, id: 'UK'},
      { page: 13, id: 'italy'},
    ].forEach((country, i) => {
      fetchPage(country.id, 300 * i, 0)
        .catch(err => { 
          console.log('err1', err)
          return fetchPage(country.id, 1000)
        })
        .catch(err => { 
          console.log('err2', err)
          return fetchPage(country.id, 2000)
        })
        .catch(err => { 
          console.log('err3', err)
          return fetchPage(country.id, 3000)
        })
        .then((response: any) => {
          const headers = response.data.values[0];
          const rows = response.data.values.slice(1);

          const dataList = headers.map((header: string, index: number) => ({
              label: header,
              data: rows.map((row: any[]) => ({ t: moment(row[0]), y: Number(row[index]?.replace(/\s+/g, '')) }))
            }))
            .slice(1)

          // console.log('dataList', dataList);

          // const dataObj = response.data.values
          //   .map((row: any) => [row.title['$t'],
          //     // convertArrayToObject(
          //       row.content['$t']
          //       .replace(/ /g, '')
          //       // .split(' ').join()
          //       .split(',')
          //       .map((r: any) => r.split(':'))
          //       .map((r: any) => [r[0], Number(r[1])])
          //       .filter((r: any) => !isNaN(r[1]))
          //     // , 0)
          //   ])
          //   .reduce((acc: { [x: string]: { t: any; y: any; }[]; }, [date, cars]: any) => {
          //     cars.forEach(([id, sales]: any[]) => {
          //       const input = { t: moment(date), y: sales };
          //       if (acc[id] === undefined) {
          //         acc[id] = [input];
          //       } else {
          //         acc[id].push(input);
          //       }
                
          //       return acc;
          //     });

          //     return acc;
          //   }, {})
          //   ;

          // const dataList = Object.keys(dataObj).map(key => ({
          //   label: key,
          //   data: dataObj[key],
          // }));

          this.setState(state => ({
            countries: { ...state.countries, [country.id]: dataList }
          }));

          // console.log('response.data', response.data);
          // console.log('response', dataObj, dataList);
        });
    })

    // Fetch connections model-brand-manafacturer
    fetchPage('Groups', 0, 0, '1l50qi3FAue2zqMOtc-vdGbXBWpb0I4lKByqUaz2nuFs')
      .then(response => {
        const manufacturer = response.data.values
          .slice(1)
          .map((row: any) => ({
            model: row[0],
            brand: row[1],
            manufacturer: row[2],
          }))
          // .map((row: any) => ({
          //   model: row.title['$t'],
          //   ...row.content['$t']
          //     .replace(/ /g, '')
          //     .split(',')
          //     .map((r: any) => r.split(':'))
          //     .filter((r: any) => r[0].length > 0)
          //     .reduce((obj: any, r: any) => {
          //       obj[r[0]] = r[1];
          //       return obj;
          //     }, {})
          // }))
          ;

        this.setState({
          manufacturer
        });
      });
  }

  fetchWebWorker = (fitItem: any, countries: Series[]) => {
    const fitSeries = countries.find(s => s.label === fitItem)?.data
    // const fitSeries = this.state.series.find((s: Series) => s.label === fitItem)?.data;
    // console.log('fitSeries', fitSeries, this.state.fitType)

    if (fitSeries && this.state.fitType === 'scurve') {
      const fitCurve = scurveFit(fitSeries.map(({ y }) => y),
        this.state.sCurveParams.a, this.state.sCurveParams.b, this.state.sCurveParams.c);

      this.setState({
        fitItem,
        sCurveParams: { a: fitCurve.a, b: fitCurve.b, c: fitCurve.c }
      });
    } else {
      this.setState({ fitItem });
    }
    // const fitSeries = this.state.series.find((s: Series) => s.label === fitItem)?.data;

    // console.log('fitSeries', fitSeries);
    // Debug
    // console.log('this.state.fitType', this.state.fitType);
    // if (fitSeries && this.state.fitType === 'scurve') {
    //   this.worker.postMessage(fitSeries?.map(({ y }) => y));
    // }
  }

  componentDidMount = () => {
    this.worker = new WebWorker(worker);

    this.worker.addEventListener('message', (event: any) => {
      // console.log('event', event);

      this.setState({
        sCurveParams: event.data
      });
    });
  }

  // runSCurveFit(fitSeries: { y: number }[]) {
  //   const fitCurve = scurveFit(fitSeries.map(({ y }) => y));
  //   console.log('fitCurve', fitCurve);

  //   this.setState({ sCurveParams: { a: fitCurve.a, b: fitCurve.b, c: fitCurve.c }});
  // }

  // componentWillUnmount() {
  //   this.worker.remove?
  // }

  render() {

    // console.log('state', this.state);
    // console.log('params', this.state.sCurveParams.a, this.state.sCurveParams.b, this.state.sCurveParams.c)

    let filteredData: Series[] = [];
    let normalize: { t: moment.Moment; y: number; }[] | undefined = undefined;
    let remove: (label: string) => boolean = () => true;

    // console.log('this.state.countries', this.state.countries);

    if (Object.keys(this.state.countries).length === 0) {
      return null;
    }

    const manafacturer =  this.state.manufacturer;
    let series = [];
    if (this.state.segment === 'fuel') {
      series = mapSeriesCut(this.state.group, this.state.countriesFuel);
    } else {
      series = mapSeriesCut(this.state.group, this.state.countries);
    }

    // console.log('series', series);

    switch (this.state.segment) {
      // case 'sweden' :
      // case 'norway' :
      // case 'germany' :
      //   remove = (label: string) => ['total-none-bev', 'total-bev'].includes(label); 
      //   normalize = seriesState.find(({ label }) => label === 'total')?.data;

      //   filteredData = seriesState
      //     .filter(({ label }) => remove(label))
      //       .map(s => ({
      //         ...s,
      //         data: s.data
      //       }));
      //   break;

      case 'model':
      case 'fuel':
        remove = (label: string) => !['Total', 'Total-None-Bev', 'Total-BEV'].includes(label);
        filteredData = series
          .filter(({ label }) => label !== 'Total' && remove(label))
            .map(s => ({
              ...s,
              data: s.data
            }));
        break;

      case 'brand':
        const mappedBrandSeries = series
          .map(s => ({
            ...s,
            label: manafacturer.find(m => m.model.toLowerCase() === s.label.toLowerCase())?.brand
          }))
          .filter(s => s.label)
          ;

        filteredData = groupBy(mappedBrandSeries, 'label')
          .map(group => ({
            label: group[0],
            data: group[1][0].data.map((d: any, i: number) => ({
              ...d,
              y: group[1].reduce((sum: number, s: any) => sum + s.data[i]?.y, 0),
            }))
          }));
        break;

      case 'manafacturer':
        const mappedManSeries = series
          .map(s => ({
            ...s,
            label: manafacturer.find(m => m.model.toLowerCase() === s.label.toLowerCase())?.manufacturer
          }))
          .filter(s => s.label)
          ;

        filteredData = groupBy(mappedManSeries, 'label')
          .map(group => ({
            label: group[0],
            data: group[1][0].data.map((d: any, i: number) => ({
              ...d,
              y: group[1].reduce((sum: number, s: any) => sum + s.data[i]?.y, 0),
            }))
          }))
          ;
        break;

      case 'segment':
        remove = (label: string) => ['Total-None-Bev', 'Total-BEV'].includes(label); 
        normalize = series.find(({ label }) => label === 'Total')?.data;
        normalize = normalize ? smooth(normalize, this.state.smooth) : undefined;

        // console.log('fit', bevX, bevX.map(fit));

        filteredData = series
          .filter(({ label }) => remove(label))
            .map(s => ({
              ...s,
              data: s.data
            }));
        break;

      case 'pyramid':
        remove = (label: string) => ['Total-None-Bev', 'Total-BEV'].includes(label); 
        normalize = series.find(({ label }) => label === 'Total')?.data;
        normalize = normalize ? smooth(normalize, this.state.smooth) : undefined;

        // console.log('fit', bevX, bevX.map(fit));

        filteredData = series
          .filter(({ label }) => remove(label))
            .map(s => ({
              ...s,
              data: s.data
            }));
        break;

      default: break;
    }

    const smoothedData = filteredData
      .map(s => ({
        label: s.label,
        data: smooth(s.data, this.state.smooth),
      }));

    console.log('smoothedData', smoothedData);
    
    return (
      <div style={{ padding: 15, height: window.innerHeight - 100 }}>
        <div style={{ padding: 4 }}>
          <span style={{ marginRight: 10 }}>
            <Popover
              content={
                <Menu>
                  <MenuDivider title="Segment"/>
                  {segments.map(({ text, id }) => <MenuItem
                    key={id}
                    text={text}
                    icon={this.state.segment === id ? "small-tick" : null}
                    onClick={() => this.setState({ segment: id })}
                    shouldDismissPopover={false}
                  />)}
                  <MenuDivider/>
                  <MenuItem text="Smoothing" >
                    {smoothing.map(({ text, value }) => <MenuItem
                      key={text}
                      text={text}
                      icon={this.state.smooth === value ? "small-tick" : null}
                      onClick={() => this.setState({ smooth: value })}
                      shouldDismissPopover={false}
                    />)}
                  </MenuItem>
                  <MenuItem text="Regression">
                    <MenuDivider title="Target"/>
                    {smoothedData.map(({ label }) => <MenuItem
                      key={label}
                      text={label}
                      icon={this.state.fitItem === label ? "small-tick" : null}
                      onClick={() => this.fetchWebWorker(label, smoothedData)}
                      shouldDismissPopover={false}
                    />)}
                    <MenuDivider title="Type"/>
                    {fitTypes.map(({ text, value }) =>
                      <MenuItem
                        key={text}
                        text={text}
                        icon={this.state.fitType === value ? "small-tick" : null}
                        onClick={() => this.setState({ fitType: value })}
                        shouldDismissPopover={false}
                      />
                    )}
                  </MenuItem>
                </Menu>
              }
            >
              <Button icon="settings" text="Options" />
            </Popover>
          </span>
          <span>
            <SelectCountries
              selected={this.state.group}
              items={Object.keys(this.state.countries)}
              onSelect={group => this.setState({ group })}
            />
          </span>
        </div>
        {this.state.segment === 'pyramid'
          ? <Pyramid series={filteredData}/>
          : <Chart
            series={smoothedData}
            normalize={normalize}
            sCurveParams={this.state.sCurveParams}
            fitType={this.state.fitType}
            fitItem={this.state.fitItem}
            smooth={this.state.smooth}
          />
        }
        {this.state.sCurveParams
          ? [this.state.sCurveParams.a, this.state.sCurveParams.b, this.state.sCurveParams.c]
            .map(v => v.toExponential(2))
            .join(' ')
          : false}
      </div>
    );
  }
}
