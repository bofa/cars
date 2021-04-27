import * as React from 'react';
import * as moment from 'moment';
import axios from 'axios';
import Chart, { Series } from './Chart';
import { FormGroup } from '@blueprintjs/core';
// import GridLayout from 'react-grid-layout';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { getPetrolStatistics } from './ssbno';
import worker from './worker.js';
import WebWorker from './workerSetup';

const ResponsiveGridLayout = WidthProvider(Responsive);

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

export class Main extends React.Component<MainProps> {
    
  state = {
    group: 'segment' as string,
    smooth: 1,
    fitType: 'linear' as string,
    fitItem: '',
    sCurveParams: null as { a: number, b: number, c: number } | null,
    manufacturer: [] as { model: string, brand?: string, manufacturer?: string } [],
    series:       [] as Series[],
    swedenGas:    [] as Series[],
    norway:       [] as Series[],
    norwayGas:    [] as Series[],
    netherlands:  [] as Series[],
    spain:        [] as Series[],
    germany:      [] as Series[],
  };

  worker: any;

  constructor(props: MainProps) {
    super(props);

    getPetrolStatistics().then(petrolSeries => {
      // console.log('data', data);
      this.setState({ norwayGas: [petrolSeries]});
    });

    axios.get('https://api.spbi.se/api/v1/products-volumes-filter?groupBy=month&perCubicMeter=false&id=5,18')
      .then(response => response.data as { name: string, data: { date: string, value: number }[] }[] )
      .then(series => series
        .map(s => ({
          label: s.name,
          data: s.data.map(d => ({ t: moment(d.date), y: d.value })).filter(d => d.t.isAfter('2015-01-01'))
      })))
      .then((swedenGas: Series[]) => this.setState({ swedenGas }));

    axios.get('norway.json')
      .then(reponse => reponse.data)
      .then(norway => this.setState({ norway }));

    axios.get('netherlands.json')
      .then(reponse => reponse.data)
      .then(netherlands => this.setState({ netherlands }));

    axios.get('spain.json')
      .then(reponse => reponse.data)
      .then(spain => this.setState({ spain }));

    // Fetch Swedish model sales
    axios.get('https://spreadsheets.google.com/feeds/list/1l50qi3FAue2zqMOtc-vdGbXBWpb0I4lKByqUaz2nuFs/1/public/basic?alt=json')
      .then(response => {
        const dataObj = response.data.feed.entry
          .map((row: any) => [row.title['$t'],
            // convertArrayToObject(
              row.content['$t']
              .replace(/ /g, '')
              // .split(' ').join()
              .split(',')
              .map((r: any) => r.split(':'))
              .map((r: any) => [r[0], Number(r[1])])
              .filter((r: any) => !isNaN(r[1]))
            // , 0)
          ])
          .reduce((acc: { [x: string]: { t: any; y: any; }[]; }, [date, cars]: any) => {
            cars.forEach(([id, sales]: any[]) => {
              const input = { t: moment(date), y: sales };
              if (acc[id] === undefined) {
                acc[id] = [input];
              } else {
                acc[id].push(input);
              }
              
              return acc;
            });

            return acc;
          }, {})
          ;

        const dataList = Object.keys(dataObj).map(key => ({
          label: key,
          data: dataObj[key],
        }));

        this.setState({
          series: dataList
        });

        // console.log('response.data', response.data);
        // console.log('response', dataObj, dataList);
      });

    // Fetch connections model-brand-manafacturer
    axios.get('https://spreadsheets.google.com/feeds/list/1l50qi3FAue2zqMOtc-vdGbXBWpb0I4lKByqUaz2nuFs/2/public/basic?alt=json')
    .then(response => {
      const manufacturer = response.data.feed.entry
        .map((row: any) => ({
          model: row.title['$t'],
          ...row.content['$t']
            .replace(/ /g, '')
            .split(',')
            .map((r: any) => r.split(':'))
            .filter((r: any) => r[0].length > 0)
            .reduce((obj: any, r: any) => {
              obj[r[0]] = r[1];
              return obj;
            }, {})
        }))
        ;

      this.setState({
        manufacturer
      });
    });

    // Fetch German sales
    axios.get('https://spreadsheets.google.com/feeds/list/1l50qi3FAue2zqMOtc-vdGbXBWpb0I4lKByqUaz2nuFs/3/public/basic?alt=json')
      .then(response => {
        const dataObj = response.data.feed.entry
          .map((row: any) => [row.title['$t'],
            // convertArrayToObject(
              row.content['$t']
              .replace(/ /g, '')
              // .split(' ').join()
              .split(',')
              .map((r: any) => r.split(':'))
              .map((r: any) => [r[0], Number(r[1])])
              .filter((r: any) => !isNaN(r[1]))
            // , 0)
          ])
          .reduce((acc: { [x: string]: { t: any; y: any; }[]; }, [date, cars]: any) => {
            cars.forEach(([id, sales]: any[]) => {
              const input = { t: moment(date), y: sales };
              if (acc[id] === undefined) {
                acc[id] = [input];
              } else {
                acc[id].push(input);
              }
              
              return acc;
            });

            return acc;
          }, {})
          ;

        const dataList = Object.keys(dataObj).map(key => ({
          label: key,
          data: dataObj[key],
        }));

        this.setState({
          germany: dataList
        });

        // console.log('response.data', response.data);
        // console.log('response', dataObj, dataList);
      });
  }

  fetchWebWorker = (e: any) => {
    const fitItem = e.target.value;
    this.setState({ fitItem });

    const fitSeries = this.state.series.find((s: Series) => s.label === fitItem)?.data;

    // console.log('fitSeries', fitSeries);
    // Debug
    console.log('this.state.fitType', this.state.fitType);
    if (fitSeries && this.state.fitType === 'scurve') {
      this.worker.postMessage(fitSeries?.map(({ y }) => y));
    }
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

  // componentWillUnmount() {
  //   this.worker.remove?
  // }

  render() {

    // console.log('manafacturer', this.state.manufacturer);

    let filteredData: Series[] = [];
    let normalize: { t: moment.Moment; y: number; }[] | undefined = undefined;
    let remove: (label: string) => boolean = () => true;
    const manafacturer = this.state.manufacturer;
    switch (this.state.group) {
      case 'models': 
        remove = (label: string) => !['total', 'total-none-bev', 'total-bev'].includes(label);
        filteredData = this.state.series
          .filter(({ label }) => label !== 'total' && remove(label))
            .map(s => ({
              ...s,
              data: s.data
            }));
        break;

      case 'swedenBrand':
        const mappedBrandSeries = this.state.series
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
              y: group[1].reduce((sum: number, series: any) => sum + series.data[i]?.y, 0),
            }))
          }))
          ;

        break;

      case 'swedenManafacturer':
          const mappedManSeries = this.state.series
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
                y: group[1].reduce((sum: number, series: any) => sum + series.data[i]?.y, 0),
              }))
            }))
            ;
  
          break;

      case 'segment': 
        remove = (label: string) => ['total-none-bev', 'total-bev'].includes(label); 
        normalize = this.state.series.find(({ label }) => label === 'total')?.data;

        // console.log('fit', bevX, bevX.map(fit));

        filteredData = this.state.series
          .filter(({ label }) => remove(label))
            .map(s => ({
              ...s,
              data: s.data
            }));

        break;

      case 'swedenGas':
        filteredData = this.state.swedenGas;
        break;

      case 'norwayGas':
        filteredData = this.state.norwayGas;
        break;

      case 'norway':
        filteredData = this.state.norway;
        break;

      case 'netherlands':
        filteredData = this.state.netherlands;
        break;

      case 'spain':
        filteredData = this.state.spain;
        break;

      case 'germany': 
        remove = (label: string) => ['total-none-bev', 'total-bev'].includes(label); 
        normalize = this.state.germany.find(({ label }) => label === 'total')?.data;

        // console.log('fit', bevX, bevX.map(fit));

        filteredData = this.state.germany
          .filter(({ label }) => remove(label))
            .map(s => ({
              ...s,
              data: s.data
            }));

        break;

      // case 'totalBrands':
      //   filteredData = [this.state.norway, this.state.netherlands, this.state.spain]
      //   break;
      default: break;
    }

    // console.log('state', this.state);

    return (
      <div style={{ padding: 15, height: window.innerHeight - 100 }}>
        <ResponsiveGridLayout className="layout" rowHeight={30}>
          <FormGroup
            data-grid={{x: 0, y: 0, w: 1, h: 2, static: true}}
            key="group"
            label="Group"
            labelFor="group"
          >
            <div className="bp3-select">
              <select
                value={this.state.group}
                onChange={e => this.setState({ group: e.target.value })}  
              >
                <option value="models">Sweden Models</option>
                <option value="swedenBrand">Sweden Brand</option>
                <option value="swedenManafacturer">Sweden Manafacturer</option>
                <option value="segment">Sweden Segment</option>
                <option value="swedenGas">Sweden Petroleum</option>
                <option value="norwayGas">Norway Petroleum</option>
                <option value="norway">Norway Brands</option>
                <option value="netherlands">Netherlands Brands</option>
                <option value="spain">Spain Brands</option>
                <option value="germany">Germany Segment</option>
                {/* <option value="totalBrands">Total Brands</option> */}
              </select>
            </div>
          </FormGroup>
          <FormGroup
            key="smoothing"
            data-grid={{x: 1, y: 0, w: 1, h: 2, static: true}}
            label="Smoothing"
            helperText="Interval too accumulate over"
            labelFor="select"
          >
            <div className="bp3-select">
              <select
                value={this.state.smooth}
                onChange={e => this.setState({ smooth: e.target.value })}  
              >
                <option value={1}>Month</option>
                <option value={3}>Quater</option>
                <option value={6}>Half Year</option>
                <option value={12}>Year</option>
                <option value={24}>Two Years</option>
                <option value={NaN}>Cumulative</option>
              </select>
            </div>
          </FormGroup>
          <FormGroup
            data-grid={{x: 2, y: 0, w: 1, h: 2, static: true}}
            key="fitType"
            label="Regression Type"
            labelFor="regression"
          >
            <div className="bp3-select">
              <select
                value={this.state.fitType}
                onChange={e => this.setState({ fitType: e.target.value })}  
              >
                <option value="linear">Linear</option>
                <option value="exponential">Exponential</option>
                <option value="scurve">S Curve</option>
              </select>
            </div>
          </FormGroup>
          <FormGroup
            data-grid={{x: 3, y: 0, w: 1, h: 2, static: true}}
            key="fitItem"
            label="Regression Item"
            labelFor="regression"
          >
            <div className="bp3-select">
              <select
                value={this.state.fitItem}
                onChange={e => this.fetchWebWorker(e)}  
              >
                <option/>
                {filteredData.map(s => 
                  <option key={s.label} value={s.label}>{s.label}</option>
                )}
              </select>
            </div>
          </FormGroup>
        </ResponsiveGridLayout>
        <Chart
          series={filteredData}
          normalize={normalize}
          sCurveParams={this.state.sCurveParams}
          fitType={this.state.fitType}
          fitItem={this.state.fitItem}
          smooth={this.state.smooth}
        />
        {this.state.sCurveParams
          ? [this.state.sCurveParams.a, this.state.sCurveParams.b, this.state.sCurveParams.c]
            .map(v => v.toExponential(2))
            .join(' ')
          : false}
      </div>
    );
  }
}
