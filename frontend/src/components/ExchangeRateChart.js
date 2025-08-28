import React from 'react';
import ReactECharts from 'echarts-for-react';

const ExchangeRateChart = ({ data, title, xAxisType = 'category' }) => {
  // 准备图表选项
  const getOption = () => {
    // 提取数据
    let xAxisData = [];
    let seriesData = [];
    
    if (xAxisType === 'time') {
      // 日期格式数据
      data.forEach(item => {
        xAxisData.push(item.date);
        seriesData.push(item.rate);
      });
    } else if (xAxisType === 'month') {
      // 月度数据
      data.forEach(item => {
        xAxisData.push(item.month);
        seriesData.push(item.average_rate);
      });
    } else if (xAxisType === 'year') {
      // 年度数据
      data.forEach(item => {
        xAxisData.push(item.year);
        seriesData.push(item.average_rate);
      });
    }
    
    return {
      title: {
        text: title,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          const param = params[0];
          return `${param.name}<br/>${param.seriesName}: ${param.value}`;
        }
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          rotate: xAxisType === 'time' ? 45 : 0,
          interval: xAxisType === 'time' ? 'auto' : 0
        }
      },
      yAxis: {
        type: 'value',
        name: '汇率',
        axisLabel: {
          formatter: '{value}'
        }
      },
      series: [{
        name: '汇率',
        type: 'line',
        data: seriesData,
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        },
        markLine: {
          data: [
            { type: 'average', name: '平均值' }
          ]
        }
      }],
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100
        },
        {
          start: 0,
          end: 100
        }
      ],
      toolbox: {
        feature: {
          dataZoom: {},
          saveAsImage: {},
          restore: {}
        }
      }
    };
  };

  return (
    <div className="chart-container">
      {data && data.length > 0 ? (
        <ReactECharts 
          option={getOption()} 
          style={{ height: '100%', width: '100%' }} 
          className="react_for_echarts" 
        />
      ) : (
        <div style={{ textAlign: 'center', paddingTop: '150px' }}>
          暂无数据
        </div>
      )}
    </div>
  );
};

export default ExchangeRateChart;