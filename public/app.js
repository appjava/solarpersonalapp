
        document.addEventListener('DOMContentLoaded', function(){
            //readDay();

            });
        
        let totalW = 0;
        let totalShort = 0;
        let totalDirect = 0;
        let totalDiffuse = 0;

        function readDay(){
            let lat = document.getElementById("lat").value;
            let lon = document.getElementById("lon").value;

            if (!lat || !lon){
                    //console.log("Por Defecto: ");
                    lat = 3.559809;
                    lon = -76.575405;
                    //console.log(lat);
                    //console.log(lon);
                }
                else {
                    //console.log("Input: ");
                    //console.log(lat);
                    //console.log(lon);
                }
            const urlINI = 'https://api.open-meteo.com/v1/forecast?';
            const urlA = 'latitude='+lat;
            const urlB = 'longitude='+lon;
            const urlC = 'current=temperature_2m,relative_humidity_2m';
            const urlD = 'hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,shortwave_radiation,direct_radiation,diffuse_radiation';
            const urlE = 'daily=temperature_2m_max,temperature_2m_min';
            const urlEND = 'wind_speed_unit=ms&timezone=auto&forecast_days=1&models=best_match';
            const urlAPI = urlINI +'&'+ urlA +'&'+ urlB +'&'+ urlC +'&'+ urlD +'&'+ urlE +'&'+ urlEND;
            console.log("API url: ");
            console.log(urlAPI);

            fetch(urlAPI)
            .then(response => response.json())
            .then(data => {

                let zonaHoraria = data.timezone;
                let elevacion = data.elevation;
                let latitud = data.latitude;
                let longitud = data.longitude;

                //Current
                let temperatura = data.current.temperature_2m;
                let humedad = data.current.relative_humidity_2m;
                
                //Hourly
                let tiempo = data.hourly.time;
                let radiacionCorta = data.hourly.shortwave_radiation;
                let radiacionDirecta = data.hourly.direct_radiation;
                let radiacionDifusa = data.hourly.diffuse_radiation;

                let viento = data.hourly.wind_speed_10m;

                let eficiencia = 1;

                const radEfectiva = radiacionCorta.map( number => eficiencia * number);
                const eEolica = viento.map( number => 0.4 * (number*number*number));
                
                let totalEolica = 0;
                eEolica.forEach( num => {
                    totalEolica += num;
                });
               
                //console.log("Radiacion Efectiva: ");
                //console.log(radEfectiva);

                //console.log(data);

                //console.log(data.latitude);
                //console.log(data.longitude);
                //console.log(zonaHoraria);
                //console.log(data.hourly.time[12]);

                //console.log(tiempo);
                //console.log(radiacionCorta);
                //console.log(viento);

                const media = mean => {
                    if (mean.length < 1){
                        return;
                    }
                    return mean.reduce((prev, current) => prev + current) / mean.length;
                };

                let mediaViento = media(viento);
                let maxViento = Math.max.apply(null,viento);

                totalW = 0;
                for (let i = 0; i < radEfectiva.length; i++){
                    totalW += radEfectiva[i];
                }
                totalShort = 0;
                for (let i = 0; i < radiacionCorta.length; i++){
                    totalShort += radiacionCorta[i];
                }
                totalDirect = 0;
                for (let i = 0; i < radiacionDirecta.length; i++){
                    totalDirect += radiacionDirecta[i];
                }
                totalDiffuse = 0;
                for (let i = 0; i < radiacionDifusa.length; i++){
                    totalDiffuse += radiacionDifusa[i];
                }
                

                //console.log("Total Energy: " + parseInt(totalW) + " Wh/m2");

                let mediaWind = 0;
                viento.forEach( num => {
                    mediaWind += num;
                });

                let mViento = mediaWind/viento.length;

                //console.log("Radiation: " + data.hourly.shortwave_radiation[12] + " W/m2");
                //console.log("Wind: " + data.hourly.wind_speed_10m[12] + " m/s");
                
                //console.log("Wind Media: " + mViento + " m/s");
                //console.log(maxViento);

                document.getElementById("boton").innerHTML=data.daily.time[0];
                document.getElementById("zonaHoraria").innerHTML=zonaHoraria;
                document.getElementById("latitud").innerHTML=latitud;
                document.getElementById("longitud").innerHTML=longitud;
                document.getElementById("elevacion").innerHTML=elevacion;
                document.getElementById("temperatura").innerHTML=temperatura;
                document.getElementById("humedad").innerHTML=humedad;
                document.getElementById("totalShort").innerHTML=parseInt(totalShort);
                document.getElementById("totalDiffuse").innerHTML=parseInt(totalDiffuse);
                document.getElementById("totalDirect").innerHTML=parseInt(totalDirect);
                document.getElementById("maxViento").innerHTML= maxViento;
                document.getElementById("mediaViento").innerHTML= mediaViento.toFixed(2);
                document.getElementById("energiaEolica").innerHTML= parseInt(totalEolica);
                
                const ctx = document.getElementById('solRadar');
                const ctx2 = document.getElementById('solGen');
                
                chartClima();
                /*
                myChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: Object.keys(radiacionCorta),
                        datasets: [
                            {
                            axis: 'x',
                            label: 'Wh/m2',
                            data: Object.values(radEfectiva),
                            borderWidth: 1,
                            fill: false,
                            borderColor: 'rgb(23, 69, 3)',
                            backgroundColor: 'rgb(230, 169, 3)',
                            tension: 0.3,
                            },

                        ]
                    },
                    options: {
                        scales: {
                            y: {beginAtZero: true}
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: 'Hourly Energy Generation',
                                padding: {
                                    top: 6,
                                    bottom: 0
                                }
                            },
                        }
                    }
                });
                */
                function chartClima(){
                    var myChart = echarts.init(document.getElementById('solRadar'));
                    
                    window.addEventListener('resize', function() {
                        myChart.resize();
                    });
                    let titulo = "Lat: " + lat.toFixed(3) + " || " + "Lon: " + lon.toFixed(3);
                    // Specify the configuration items and data for the chart
                    var option = {
                        title: {
                          text: "Wh/m2"
                        },
                        tooltip: {
                          trigger: 'axis',
                          axisPointer: {
                            type: 'cross',
                            label: {
                              backgroundColor: '#6a7985'
                            }
                          }
                        },
                        legend: {
                          data: ['Shortwave', 'Direct', 'Diffuse']
                        },
                        toolbox: {
                          feature: {
                            saveAsImage: {}
                          }
                        },
                        grid: {
                          left: '3%',
                          right: '4%',
                          bottom: '3%',
                          containLabel: true
                        },
                        xAxis: [
                          {
                            type: 'category',
                            boundaryGap: false,
                            data: Object.keys(radiacionCorta)
                          }
                        ],
                        yAxis: [
                          {
                            type: 'value'
                          }
                        ],
                        series: [
                          {
                            name: 'Shortwave',
                            type: 'line',
                            smooth: true,
                            color: '#e6a903',
                            areaStyle: {
                                
                            },
                            emphasis: {
                              focus: 'series'
                            },
                            data: Object.values(radiacionCorta)
                          },
                          {
                            name: 'Direct',
                            type: 'line',
                            smooth: true,
                            color: 'blue',
                            areaStyle: {
                                
                            },
                            emphasis: {
                              focus: 'series'
                            },
                            data: Object.values(radiacionDirecta)
                          },
                          {
                            name: 'Diffuse',
                            type: 'line',
                            smooth: true,
                            color: 'green',
                            areaStyle: {
                                
                            },
                            emphasis: {
                              focus: 'series'
                            },
                            data: Object.values(radiacionDifusa)
                          }
                        ]
                      };
              
                    // Display the chart using the configuration items and data just specified.
                    myChart.setOption(option);
                }
            });

        }

        function clearDay(){
            //myChart.clear();
            //myChart.destroy();
            readDay();
        }

        function clima(){
            document.getElementById("intro").style.display="none";
            document.getElementById("carga").style.display="none";
            document.getElementById("resume").style.display="none";
            document.getElementById("clima").style.display="unset";
            readDay();
        }
        function cargas(){
            document.getElementById("intro").style.display="none";
            document.getElementById("clima").style.display="none";
            document.getElementById("resume").style.display="none";
            document.getElementById("carga").style.display="unset";
            calcular();
        }
        function resumen(){
            document.getElementById("clima").style.display="none";
            document.getElementById("carga").style.display="none";
            document.getElementById("intro").style.display="none";
            document.getElementById("resume").style.display="unset";
            
            
            fetch('https://api.thingspeak.com/channels/953284/feeds.json?results=2')
            .then(response => response.json())
            .then(data => {
                let incuTemperatura = data.feeds[1].field1;
                let incuHumedad = data.feeds[1].field2;
                let incuTime = data.feeds[1].created_at;

                let incuTemp = parseFloat(incuTemperatura).toFixed(2);
                let incuHum = parseFloat(incuHumedad).toFixed(2);

                //console.log("Temperature INCU (°C): ");
                //console.log(incuTemp);
                //console.log("Humidity INCU (%): ");
                //console.log(incuHum);

                //document.getElementById('titulo').innerHTML = "TempINCU: "+incuTemp+" °C"+" | "+incuHum+" %"+" :HumINCU";
                document.getElementById('incubadora').innerHTML = `
                <h4>Incubator</h4>
                <h4>Temperature: ${incuTemp} °C | ${incuHum} % : Humidity</h4>
                <h5>${incuTime}</h5>
                `;
            });

                var potInstalada = document.getElementById("pvWatts").value;
                if(!potInstalada){
                    potInstalada = 0;
                }

                let areaInstalada = 0.28 * potInstalada/50;

                var typePanel = document.getElementById("tipoPanel").value;

                if(typePanel==="policristalino"){
                    var effiPanel = 0.15;
                }
                else if(typePanel==="monocristalino"){
                    var effiPanel = 0.20;
                }
                else{
                    var effiPanel = 0.12;
                }

                let eGenerada = parseInt(areaInstalada * effiPanel * totalShort);

            document.getElementById("balance").innerHTML = `
                
                <div id="mostrar">
                <div id="generado">
                    <h3>Potential</h3>
                    <h1>${parseInt(totalShort)}</h1>
                    <h3>Wh</h3>    
                </div>
                <div id="generado">
                    <h3>Generated</h3>
                    <h1>${parseInt(eGenerada)}</h1>
                    <h3>Wh</h3>    
                </div>
                <div id="usado">
                    <h3>Used</h3>
                    <h1>${parseInt(totalWH)}</h1>
                    <h3>Wh</h3>    
                </div>
                <!--<h3>Generated: ${parseInt(totalW)} Wh || ${parseInt(totalWH)} Wh :Used</h3>-->
                </div>
                `;
                chartResume();
                function chartResume(){
                    var myChart = echarts.init(document.getElementById('gauge'));
                    
                    window.addEventListener('resize', function() {
                        myChart.resize();
                    });

                    /*
                    // Specify the configuration items and data for the chart
                    const gaugeData = [
                        {
                          value: totalShort/100,
                          name: 'Potential',
                          title: {
                            offsetCenter: ['0%', '-50%']
                          },
                          detail: {
                            valueAnimation: true,
                            offsetCenter: ['0%', '-30%']
                          }
                        },
                        {
                          value: eGenerada/100,
                          name: 'Generated',
                          title: {
                            offsetCenter: ['0%', '-10%']
                          },
                          detail: {
                            valueAnimation: true,
                            offsetCenter: ['0%', '10%']
                          }
                        },
                        {
                          value: totalWH/100,
                          name: 'Used',
                          title: {
                            offsetCenter: ['0%', '30%']
                          },
                          detail: {
                            valueAnimation: true,
                            offsetCenter: ['0%', '50%']
                          }
                        }
                      ];
                    let option = {
                        series: [
                          {
                            type: 'gauge',
                            startAngle: 90,
                            endAngle: -270,
                            pointer: {
                              show: false
                            },
                            progress: {
                              show: true,
                              overlap: false,
                              roundCap: true,
                              clip: false,
                              itemStyle: {
                                borderWidth: 1,
                                borderColor: '#464646'
                              }
                            },
                            axisLine: {
                              lineStyle: {
                                width: 50
                              }
                            },
                            splitLine: {
                              show: false,
                              distance: 0,
                              length: 10
                            },
                            axisTick: {
                              show: false
                            },
                            axisLabel: {
                              show: false,
                              distance: 50
                            },
                            data: gaugeData,
                            title: {
                              fontSize: 14
                            },
                            detail: {
                              width: 50,
                              height: 14,
                              fontSize: 14,
                              color: 'inherit',
                              borderColor: 'inherit',
                              borderRadius: 20,
                              borderWidth: 1,
                              formatter: '{value}'
                            }
                          }
                        ]
                      };
                    */ 
                      option = {
                        title: [
                          {
                            text: 'Daily WH Balance'
                          }
                        ],
                        polar: {
                          radius: [30, '80%']
                        },
                        angleAxis: {
                          max: 4000,
                          startAngle: 75
                        },
                        radiusAxis: {
                          type: 'category',
                          data: ['Used', 'Generated', 'Potential']
                        },
                        tooltip: {},
                        series: {
                          type: 'bar',
                          data: [totalWH, eGenerada, totalShort],
                          coordinateSystem: 'polar',
                          label: {
                            show: true,
                            position: 'middle',
                            formatter: '{b}: {c}'
                          }
                        }
                      };
              
                    // Display the chart using the configuration items and data just specified.
                    myChart.setOption(option);
                }

            }       
        let totalWH = 0;

        function calcular(){
            totalWH = 0;
            let meArray = [];
            for (let i = 0; i < 10; i++){
                var cantidad = document.getElementById("cant"+i).value;
                if(!cantidad){
                    cantidad = 0;
                }
                var vatios = document.getElementById("watt"+i).value;
                if(!vatios){
                    vatios = 0;
                }
                var horas = document.getElementById("hour"+i).value;
                if(!horas){
                    horas = 0;
                }
                let wattHora = parseFloat(cantidad)*parseFloat(vatios)*parseFloat(horas);
                document.getElementById("wh"+i).innerHTML = wattHora; 
                totalWH = totalWH + wattHora;
                meArray.push(wattHora);
                
            }
            
            //console.log(totalWH);
            document.getElementById('calculo').innerHTML = "Total Watts: "+totalWH+" W-H";
            loadChart(meArray);
    
        }

        function loadChart(tCargas){
            // Initialize the echarts instance based on the prepared dom
            var myChart = echarts.init(document.getElementById('main'));
            
            window.addEventListener('resize', function() {
                myChart.resize();
            });
      
            // Specify the configuration items and data for the chart
            var option = {
                color: [
                    '#e6a903'
                ],
              title: {
                text: ''
              },
              tooltip: {},
              legend: {
                data: ['Wh']
              },
              xAxis: {
                data: ['TV', 'Laptop', 'Phone', 'Tablet', 'Light', 'WiFi', 'HiFi', 'CCTV', 'IoT', 'Other']
              },
              yAxis: {},
              series: [
                {
                  name: 'Wh',
                  type: 'bar',
                  data: tCargas
                }
              ]
            };
      
            // Display the chart using the configuration items and data just specified.
            myChart.setOption(option);
        }
        function limpiar(){
            totalWH = 0;
            meArray = 0;
            loadChart(meArray);

            for (let i = 0; i < 10; i++){
                document.getElementById("cant"+i).value = 0;
                
                document.getElementById("watt"+i).value = 0;
                
                document.getElementById("hour"+i).value = 0;
                
                document.getElementById("wh"+i).innerHTML = 0;
            }

            document.getElementById('calculo').innerHTML = "Total Watts: "+totalWH+" W-H";
            //console.log(totalWH);
        }
               
