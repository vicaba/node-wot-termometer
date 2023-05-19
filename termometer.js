const Servient = require('@node-wot/core').Servient;
const HttpServer = require('@node-wot/binding-http').HttpServer;

const servient = new Servient();
servient.addServer(new HttpServer());

let temperature = 0;

servient.start().then((WoT) => {
    WoT.produce({
        title: "TemperatureController",
        description: "A Thing to control the temperature of the room and also get alerts in too high temperatures",
        properties: {
            temperature: {
                type: "integer",
                description: "Current temperature value",
                observable: true,
                readOnly: true,
                unit: "Celcius"
            }
        },
        actions: {
            increment: {
                description: "Incrementing the temperature of the room with 0 to 5 increments",
                input: {
                    type: "integer",
                    minimum: 0,
                    maximum: 5
                }
            },
            decrement: {
                description: "Decrementing the temperature of the room with 0 to 5 increments",
                input: {
                    type: "integer",
                    minimum: 0,
                    maximum: 5
                }
            }
        },
        events: {
            overheat: {
                description: "Alert sent when the room temperature is too high"
            }
        }
    })
        .then(function (thing) {
            console.log("Produced " + thing.getThingDescription().title);
            console.log(thing)

            // init property values
            temperature = 20;

            thing.setPropertyReadHandler("temperature", function () {
                return new Promise((resolve, reject) => {
                    resolve(temperature);
                });
            });

            // set action handlers
            thing.setActionHandler("increment", async function (params, options) {
                console.log("incrementing temperature with")
                params.value().then((value) => {
                    console.log(value)
                    changeTemperature(getTemperature() + value)
                })
            });

            thing.setActionHandler("decrement", async function (params, options) {
                console.log("decrementing temperature with")
                params.value().then((value) => {
                    console.log(value)
                    changeTemperature(getTemperature() - value)
                })
            });

            // check the temperature every 5 seconds, alert if temperature too high
            setInterval(() => {
                console.log("current temperature is ", temperature)
                temperature = temperature + 1;

                thing.emitPropertyChange("temperature", temperature);

                if (temperature % 10 === 0) {
                    thing.emitEvent("overheat", temperature);
                }
            }, 1000);

            // expose the thing
            thing.expose().then(function () {
                console.info(thing.getThingDescription().title + " ready");
            });

            function getTemperature() {
                // normally, you would call the temperature sensor's function to read the actual temperature value
                // return new Promise((resolve, reject) => {
                return temperature;
                // resolve(5); //uncomment to test incrementing etc.
                //  });
            }

            function changeTemperature(newValue) {
                // normally, you would do physical action to change the temperature
                //do nothing
                temperature = newValue;
            }
        })
        .catch(function (e) {
            console.log(e);
        });
});
