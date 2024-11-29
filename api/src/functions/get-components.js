const { app } = require("@azure/functions");

const { load } = require("@azure/app-configuration-provider");
const connectionString = process.env.AZURE_APPCONFIG_CONNECTION_STRING;

app.http("get-components", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    context.log(`Http function processed request for url "${request.url}"`);

    const service = request.query.get("service");

    const settings = await load(connectionString, {
      selectors: [
        {
          keyFilter: "components",
          labelFilter: service,
        },
      ],
    });

    const components = settings.get("components");
    const componentsObj = JSON.parse(components);

    return {
      jsonBody: {
        componentsObj,
      },
      headers: {
        "Content-Type": "application/json",
      },
      status: 200,
    };
  },
});
