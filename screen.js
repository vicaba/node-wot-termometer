const { Servient, Helpers } = require("@node-wot/core");
const { HttpClientFactory } = require('@node-wot/binding-http');

const prompt = require("prompt-sync")();

const temperatureControllerAddress = prompt("Temperature Controller address: ");

const servient = new Servient();
servient.addClientFactory(new HttpClientFactory(null));
const WoTHelpers = new Helpers(servient);

WoTHelpers.fetch(temperatureControllerAddress).then(async (td) => {
    try {
        servient.start().then(async (WoT) => {
            const thing = await WoT.consume(td);
            console.log("Thing Description:", td);

            await thing.subscribeEvent("overheat", async (data) => {
                console.log("overheat event:", await data.value());
            });

        });
    }
    catch (err) {
        console.error("Script error:", err);
    }
}).catch((err) => { console.error("Fetch error:", err); });