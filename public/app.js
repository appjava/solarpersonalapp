
        let radiacionCorta = [];
        let radiacionDirecta = [];
        let radiacionDifusa = [];
        let tiempo = [];

        let eEolica = [];

        let totalW = 0;
        let totalWH = 0;

        let totalShort = 0;
        let totalDirect = 0;
        let totalDiffuse = 0;

        let potInstalada = 0;
        let inverter = 0;

        let horaGenerada = [];

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
                tiempo = data.hourly.time;
                radiacionCorta = data.hourly.shortwave_radiation;
                radiacionDirecta = data.hourly.direct_radiation;
                radiacionDifusa = data.hourly.diffuse_radiation;

                let viento = data.hourly.wind_speed_10m;

                eEolica = viento.map( number => 0.4 * (number*number*number));
                
                let totalEolica = 0;
                eEolica.forEach( num => {
                    totalEolica += num;
                });

                const media = mean => {
                    if (mean.length < 1){
                        return;
                    }
                    return mean.reduce((prev, current) => prev + current) / mean.length;
                };

                let mediaViento = media(viento);
                let maxViento = Math.max.apply(null,viento);

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
                
                let mediaWind = 0;
                viento.forEach( num => {
                    mediaWind += num;
                });

                let mViento = mediaWind/viento.length;

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
                function chartClima(){
                    var myChart = echarts.init(document.getElementById('solRadar'));
                    myChart.resize();
                    window.addEventListener('resize', function() {
                        myChart.resize();
                    });
                    
                    // Specify the configuration items and data for the chart
                    var option = {
                        title: {
                          text: ""
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
                            data: Object.keys(tiempo)
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
            document.getElementById("nav").style.display="unset";

            document.getElementById("cargas").style.display="unset";
            document.getElementById("potencial").style.display="none";
            document.getElementById("sumario").style.display="unset";
            readDay();
        }
        function cargas(){
            document.getElementById("intro").style.display="none";
            document.getElementById("clima").style.display="none";
            document.getElementById("resume").style.display="none";
            document.getElementById("carga").style.display="unset";

            document.getElementById("potencial").style.display="unset";
            document.getElementById("cargas").style.display="none";
            document.getElementById("sumario").style.display="unset";
            calcular();
        }
        function resumen(){
            document.getElementById("clima").style.display="none";
            document.getElementById("carga").style.display="none";
            document.getElementById("intro").style.display="none";
            document.getElementById("resume").style.display="unset";

            document.getElementById("potencial").style.display="unset";
            document.getElementById("cargas").style.display="unset";
            document.getElementById("sumario").style.display="none";
            
            fetch('https://api.thingspeak.com/channels/953284/feeds.json?results=2')
            .then(response => response.json())
            .then(data => {
                let incuTemperatura = data.feeds[1].field1;
                let incuHumedad = data.feeds[1].field2;
                let incuTime = data.feeds[1].created_at;

                let incuTemp = parseFloat(incuTemperatura).toFixed(2);
                let incuHum = parseFloat(incuHumedad).toFixed(2);

                document.getElementById('incubadora').innerHTML = `
                <h4>Incubator</h4>
                <h4>Temperature: ${incuTemp} °C | ${incuHum} % : Humidity</h4>
                <h5>${incuTime}</h5>
                `;
            });

                potInstalada = document.getElementById("pvWatts").value;
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
                
                horaGenerada = radiacionCorta.map( number => parseInt(number * areaInstalada * effiPanel));
                
                totalW = totalShort;
                let eGenerada = parseInt(areaInstalada * effiPanel * totalW);

                document.getElementById("balance").innerHTML = `
                  <div id="generado">
                      <h3>Potential</h3>
                      <h1>${parseInt(totalW)}</h1>
                      <h3>Wh</h3>    
                  </div>
                  <div id="usado">
                      <h3>Used</h3>
                      <h1>${parseInt(totalWH)}</h1>
                      <h3>Wh</h3>    
                  </div>
                  <div id="generado">
                      <h3>Generated</h3>
                      <h1>${parseInt(eGenerada)}</h1>
                      <h3>Wh</h3>    
                  </div>
                `;
                document.getElementById("kilosMes").innerHTML = `
                <h3>Monthly Energy Generated</h3>
                <h2>${(eGenerada*30/1000).toFixed(1)}</h2>
                <h3>kWh</h3>
                `;

                let nominalPanel = potInstalada;
                let searchPanel = "solar+panel+12+v+" + nominalPanel + "+watt";
                let searchUrlPanel1 = "https://www.amazon.com/s?k="+searchPanel;
                let searchUrlPanel2 = "https://www.ebay.com/sch/"+searchPanel;

                document.getElementById("panelesInstalados").innerHTML = `
                <h3>Installed Photovolltaic System</h3>
                <a href="${searchUrlPanel1}" target="_blank"><h2>${nominalPanel}</h2></a>
                <a href="${searchUrlPanel2}" target="_blank"><h3>Watts</h3></a>
                `;
                document.getElementById("cargaSimultanea").innerHTML = `
                <h3>Simultaneous Load</h3>
                <h2>${inverter}</h2>
                <h3>Watts</h3>
                `;
                
                let nominalInverter = parseInt(inverter*2);
                let searchInverter = "inverter+12+v+" + nominalInverter + "+watt";
                let searchUrlInverter1 = "https://www.amazon.com/s?k="+searchInverter;
                let searchUrlInverter2 = "https://www.ebay.com/sch/"+searchInverter;

                let nominalBattery = parseInt((eGenerada/13)*1.3);
                let searchBattery = "battery+12+v+" + nominalBattery + "+ah";
                let searchUrlBattery1 = "https://www.amazon.com/s?k="+searchBattery;
                let searchUrlBattery2 = "https://www.ebay.com/sch/"+searchBattery;
                

                document.getElementById("inversor").innerHTML = `
                <div id="inverter">
                <h3>DC/AC Inverter Up</h3>
                <a href="${searchUrlInverter1}" target="_blank"><h2>${nominalInverter}</h2></a>
                <a href="${searchUrlInverter2}" target="_blank"><h3>Watts</h3></a>
                </div>
                <div id="inverter">
                <h3>12VDC Battery Up</h3>
                <a href="${searchUrlBattery1}" target="_blank"><h2>${nominalBattery}</h2></a>
                <a href="${searchUrlBattery2}" target="_blank"><h3>AH</h3></a>
                </div>
                `;

                chartResume();
                function chartResume(){
                    var myBalance = echarts.init(document.getElementById('gauge'));
                    myBalance.resize();
                    window.addEventListener('resize', function() {
                        myBalance.resize();
                    });
                      option = {
                        title: [
                          {
                            text: ''
                          }
                        ],
                        polar: {
                          radius: [30, '75%']
                        },
                        angleAxis: {
                          max: totalShort*1.15,
                          startAngle: 90
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
                            position: 'start',
                            formatter: '{b}',
                          }
                        }
                      };
              
                    // Display the chart using the configuration items and data just specified.
                    myBalance.setOption(option);
                }

                let loadSimultanea = [];
                for (let i = 0; i < tiempo.length; i++){
                  loadSimultanea.push(inverter);
                }

                let mediaGenerada = [];
                for (let i = 0; i < tiempo.length; i++){
                  mediaGenerada.push(parseInt(eGenerada/tiempo.length));
                }

                let mediaUsada = [];
                for (let i = 0; i < tiempo.length; i++){
                  mediaUsada.push(parseInt(totalWH/tiempo.length));
                }

                chartHoraGenerada();
                function chartHoraGenerada(){

                  var myGenerada = echarts.init(document.getElementById('horaGenerada'));
                  myGenerada.resize();
                  window.addEventListener('resize', function() {
                      myGenerada.resize();
                  });
                  
                  // Specify the configuration items and data for the chart
                var option = {
                  title: {
                    text: ""
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
                    data: ['Hourly Watts Generated', 'Avg Generated Wh', 'Avg Used Wh']
                  },
                  toolbox: {
                    feature: {
                      
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
                      data: Object.keys(tiempo)
                    }
                  ],
                  yAxis: [
                    {
                      type: 'value'
                    }
                  ],
                  series: [
                    {
                      name: 'Hourly Watts Generated',
                      type: 'bar',
                      smooth: true,
                      color: 'green',
                      emphasis: {
                        focus: 'series'
                      },
                      data: horaGenerada
                    },
                    {
                      name: 'Avg Generated Wh',
                      type: 'line',
                      smooth: true,
                      color: '#e6a903',
                      emphasis: {
                        focus: 'series'
                      },
                      data: mediaGenerada
                    },
                    {
                      name: 'Avg Used Wh',
                      type: 'line',
                      smooth: true,
                      color: 'red',
                      emphasis: {
                        focus: 'series'
                      },
                      data: mediaUsada
                    }
                  ]
                };
            
                  // Display the chart using the configuration items and data just specified.
                  myGenerada.setOption(option);
              }
        }
        function calcular(){
            totalWH = 0;
            inverter = 0;
            let meArray = [];
            let inversor = [];
            let prendido = 0;

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
                if(!horas || horas == 0){
                    horas = 0;
                    prendido = 0;
                }else{
                    prendido = 1;
                }
                let wattHora = parseFloat(cantidad)*parseFloat(vatios)*parseFloat(horas);
                document.getElementById("wh"+i).innerHTML = wattHora; 
                totalWH = totalWH + wattHora;
                meArray.push(wattHora);

                let sumInvert = parseFloat(cantidad)*parseFloat(vatios)*prendido;
                inversor.push(sumInvert);
            }

            document.getElementById('calculo').innerHTML = "Total Watts: "+totalWH+" W-H";
            loadChart(meArray);
            
            inversor.forEach( num => {
                inverter += num;
            });
        }
        function loadChart(tCargas){
            // Initialize the echarts instance based on the prepared dom
            var myLoads = echarts.init(document.getElementById('main'));
            myLoads.resize();
            window.addEventListener('resize', function() {
                myLoads.resize();
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
            myLoads.setOption(option);
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
               
