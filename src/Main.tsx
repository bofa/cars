import * as React from 'react';
import * as moment from 'moment';
import axios from 'axios';
import Chart, { Series } from './Chart';
import { FormGroup } from '@blueprintjs/core';
// import GridLayout from 'react-grid-layout';
import { Responsive, WidthProvider } from 'react-grid-layout';

const ResponsiveGridLayout = WidthProvider(Responsive);

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { getPetrolStatistics } from './ssbno';

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
    group: 'models' as string,
    smooth: 12,
    series: [] as Series[],
    swedenGas: [] as Series[],
    norway: [] as Series[],
    norwayGas: [] as Series[],
    netherlands: [] as Series[],
    spain: [] as Series[],
  };

  constructor(props: MainProps) {
    super(props);

    getPetrolStatistics().then(petrolSeries => {
      // console.log('data', data);
      this.setState({ norwayGas: [petrolSeries]});
    });

    axios.get('https://api.spbi.se/api/v1/products-volumes-filter?groupBy=month&perCubicMeter=false&id=12%2C13%2C8%2C27%2C16%2C23%2C3%2C5%2C18%2C19')
      .then(response => response.data as { name: string, data: { date: string, value: number }[] }[] )
      // .then(data => console.log('swe petrolium', data));
      .then(series => series.map(s => ({
        label: s.name,
        data: s.data.map(d => ({ t: moment(d.date), y: d.value })).filter(d => d.t.isAfter('2015-01-01'))
      })))
      .then((swedenGas: Series[]) => this.setState({ swedenGas }));
    // axios.get('norway-gas.json')
    //   .then(reponse => reponse.data)
    //   .then(norwayGas => this.setState({ norwayGas }));

    axios.get('norway.json')
      .then(reponse => reponse.data)
      .then(norway => this.setState({ norway }));

    axios.get('netherlands.json')
      .then(reponse => reponse.data)
      .then(netherlands => this.setState({ netherlands }));

    axios.get('spain.json')
      .then(reponse => reponse.data)
      .then(spain => this.setState({ spain }));

    axios
      .get('https://spreadsheets.google.com/feeds/list/1l50qi3FAue2zqMOtc-vdGbXBWpb0I4lKByqUaz2nuFs/1/public/basic?alt=json')
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

        console.log('response.data', response.data);
        console.log('response', dataObj, dataList);
      });
  }

  render() {

    let filteredData: Series[] = [];
    let remove: (label: string) => boolean = () => true;
    switch (this.state.group) {
      case 'models': 
        remove = (label: string) => !['total', 'totalnonebev', 'totalbev'].includes(label);
        filteredData = this.state.series
          .filter(({ label }) => label !== 'total' && remove(label))
            .map(s => ({
              ...s,
              data: s.data
            }));
        break;
      case 'segment': 
        remove = (label: string) => ['total', 'totalnonebev', 'totalbev'].includes(label); 
        filteredData = this.state.series
          .filter(({ label }) => label !== 'total' && remove(label))
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
      // case 'totalBrands':
      //   filteredData = [this.state.norway, this.state.netherlands, this.state.spain]
      //   break;
      default: break;
    }

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
                <option value="segment">Sweden Segment</option>
                <option value="swedenGas">Sweden Petroleum</option>
                <option value="norwayGas">Norway Petroleum</option>
                <option value="norway">Norway Brands</option>
                <option value="netherlands">Netherlands Brands</option>
                <option value="spain">Spain Brands</option>
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
                <option value={1000}>Cumulative</option>
              </select>
            </div>
          </FormGroup>
        </ResponsiveGridLayout>
        <Chart series={filteredData} smooth={this.state.smooth} />
      </div>
    );
  }
}
