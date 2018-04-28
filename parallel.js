function draw_parallel() {
    let dom = document.getElementById("container");
    let myChart = echarts.init(dom);

    const dataBJ = [[69805, 1089, 803, 38.6, 'Frequent'],
        [27206, 1120, 617, 31.8, 'Frequent'],
        [69805, 1089, 803, 38.6, 'Frequent'],
        [22411, 873, 824, 32.2, 'Frequent'],
        [43817, 1557, 1457, 47.3, 'Frequent'],
        [63438, 1947, 1152, 31.2, 'Frequent'],
        [69805, 1089, 803, 38.6, 'Frequent'],
        [74136, 1879, 1172, 31.7, 'Frequent'],
        [66523, 2379, 1324, 30.2, 'Frequent'],
        [69805, 1089, 803, 38.6, 'Frequent'],
        [9808, 826, 500, 41.3, 'Frequent'],
        [85536, 1206, 734, 34.6, 'Frequent'],
        [69805, 1089, 803, 38.6, 'Frequent'],
        [59811, 979, 837, 30.8, 'Frequent'],
        [69805, 1089, 803, 38.6, 'Frequent'],
        [74136, 1879, 1172, 31.7, 'Frequent'],
        [69805, 1089, 803, 38.6, 'Frequent'],
        [43817, 1557, 1457, 47.3, 'Frequent'],
        [49545, 1137, 823, 33.6, 'Frequent']
    ];

    const dataGZ = [
        [8897, 763, 531, 31.7, 'Infrequent'],
        [72857, 799, 495, 29.8, 'Infrequent'],
        [7370, 838, 300, 21.3, 'Infrequent'],
        [74659, 1363, 784, 30.2, 'Infrequent'],
        [24688, 763, 532, 33.8, 'Infrequent'],
        [14440, 4881, 25, 19.4, 'Infrequent'],
        [20893, 762, 455, 41.2, 'Infrequent'],
        [41042, 695, 439, 33.6, 'Infrequent'],
        [22788, 228, 164, 28.3, 'Infrequent'],
        [25857, 801, 420, 22.4, 'Infrequent'],
        [59811, 979, 837, 30.8, 'Infrequent'],
        [59811, 979, 837, 30.8, 'Infrequent'],
        [43817, 1557, 1457, 47.3, 'Infrequent'],
        [49545, 1137, 823, 33.6, 'Infrequent'],
        [38393, 274, 265, 33.6, 'Infrequent'],
        [59811, 979, 837, 30.8, 'Infrequent'],
        [10108, 1214, 472, 20.6, 'Infrequent'],
        [21597, 956, 459, 26.4, 'Infrequent'],
        [27338, 1239, 1053, 28.0, 'Infrequent'],
        [43817, 1557, 1457, 47.3, 'Infrequent'],
        [17813, 1182, 454, 21.9, 'Infrequent'],
        [14250, 3366, 27, 19.9, 'Infrequent'],
        [73500, 1773, 1278, 30.5, 'Infrequent'],
        [85536, 1206, 734, 34.6, 'Infrequent'],
        [21597, 956, 459, 26.4, 'Infrequent'],
        [16438, 634, 597, 28.3, 'Infrequent']
    ];

    const dataSH = [
        [43817, 1557, 1457, 47.3, 'Very frequent']
    ];

    let schema = [
        {name: 'Income', index: 0, text: 'Income'},
        {name: 'Residents', index: 1, text: 'Residents'},
        {name: 'Households', index: 2, text: 'Households'},
        {name: 'Age', index: 3, text: 'Age'},
        {name: 'Usage frequency', index: 4, text: ' Usage frequency'}
    ];

    let lineStyle = {
        normal: {
            width: 1,
            opacity: 0.5
        }
    };

    let option = {
        legend: {
            bottom: 30,
            data: ['Frequent', 'Very frequent', 'Infrequent'],
            itemGap: 20,
            textStyle: {
                color: '#222',
                fontSize: 14
            }
        },
        tooltip: {
            padding: 10,
            backgroundColor: '#222',
            borderColor: '#777',
            borderWidth: 1,
            formatter: function (obj) {
                let value = obj[0].value;
                return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
                    + obj[0].seriesName + ' ' + value[0] + 'Date：'
                    + value[7]
                    + '</div>'
                    + schema[1].text + '：' + value[1] + '<br>'
                    + schema[2].text + '：' + value[2] + '<br>'
                    + schema[3].text + '：' + value[3] + '<br>'
                    + schema[4].text + '：' + value[4] + '<br>';
            }
        },
        parallelAxis: [
            {dim: 0, name: schema[0].text},
            {dim: 1, name: schema[1].text},
            {dim: 2, name: schema[2].text},
            {dim: 3, name: schema[3].text},
            {dim: 4, name: schema[4].text,
                type: 'category', data: ['Infrequent', 'Frequent', 'Very frequent']}
        ],
        parallel: {
            left: '5%',
            right: '18%',
            bottom: 100,
            parallelAxisDefault: {
                type: 'value',
                name: 'Income',
                nameLocation: 'end',
                nameGap: 20,
                nameTextStyle: {
                    color: '#222',
                    fontSize: 12
                },
                axisLine: {
                    lineStyle: {
                        color: '#aaa'
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: '#777'
                    }
                },
                splitLine: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        color: 'black'
                    }
                }
            }
        },
        series: [
            {
                name: 'Frequent',
                type: 'parallel',
                lineStyle: lineStyle,
                data: dataBJ
            },
            {
                name: 'Very frequent',
                type: 'parallel',
                lineStyle: lineStyle,
                data: dataSH
            },
            {
                name: 'Infrequent',
                type: 'parallel',
                lineStyle: lineStyle,
                data: dataGZ
            }
        ]
    };

    if (option && typeof option === "object") {
        myChart.setOption(option, true);
    }
}
