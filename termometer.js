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

            // set read handlers
            thing.setPropertyReadHandler("temperature", async function () {
                return temperature;
            });

            // set action handlers
            thing.setActionHandler("increment", function (value, options) {
                changeTemperature(getTemperature() + value)
            });

            thing.setActionHandler("decrement", function (value, options) {
                changeTemperature(getTemperature() - value)
            });

            // Increase temperature every second
            setInterval(() => {
                console.log(`current temperature is ${temperature}`)

                temperature = temperature + 1;
                // emit a change
                thing.emitPropertyChange("temperature", temperature);

                // alert if temperature too high
                if (temperature % 10 === 0) {
                    console.log("Emit overheat event")
                    thing.emitEvent("overheat", temperature);
                }
            }, 1000);

            // expose the thing
            thing.expose().then(function () {
                console.info(thing.getThingDescription().title + " ready");
            });

            function getTemperature() {
                return temperature;
            }

            function changeTemperature(newValue) {
                temperature = newValue;
            }
        })
        .catch(function (e) {
            console.log(e);
        });
});