function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(
    /[?&]+([^=&]+)=([^&]*)/gi,
    function (m, key, value) {
      vars[key] = value;
    }
  );
  return vars;
}

async function fetchData() {
  try {
    const data = await (
      await fetch(`/api/get-components?service=` + serviceName)
    ).json();
    var dataKeys = [];
    console.log(data);
    var newData = Array.isArray(data.componentsObj)
      ? data.componentsObj
      : [data.componentsObj];

    // Create table
    var table = document.createElement("table");
    table.className = "table table-bordered table-striped";
    table.id = "data-table";

    // loop over the items in newData
    newData.forEach((obj) => {
      // append the keys to a new variable
      Object.keys(obj).forEach((key) => {
        if (!dataKeys.includes(key)) {
          dataKeys.push(key);
        }
      });
    });

    console.log(dataKeys);
    var thead = table.createTHead();
    var headerRow = thead.insertRow();
    headerRow.className = "thead-dark";

    keyValues.forEach((keyValue) => {
      if (dataKeys.includes(keyValue.name)) {
        var cell = headerRow.insertCell();
        cell.innerHTML = keyValue.display;
      }
    });

    var tbody = table.createTBody();
    newData.forEach((obj) => {
      var row = tbody.insertRow();
      keyValues.forEach((keyValue) => {
        var newValue = "";
        console.log("Checking:" + keyValue.name);
        if (dataKeys.includes(keyValue.name)) {
          if (obj[keyValue.name]) {
            if (keyValue.sub && keyValue.sub[obj[keyValue.name]]) {
              newValue = keyValue.sub[obj[keyValue.name]];
            } else {
              if (keyValue.format === "toUpper") {
                newValue = obj[keyValue.name].toUpperCase();
              } else if (keyValue.format === "strip") {
                newValue = obj[keyValue.name]
                  .replace(/_/g, " ")
                  .replace(/\w\S*/g, function (txt) {
                    return (
                      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                    );
                  });
              } else {
                newValue = obj[keyValue.name];
              }
            }
            var cell = row.insertCell();
            // cell.className = "filter-select"; // dont think this is needed anymore due to filter_functions??
            cell.innerHTML = newValue;
          } else {
            var cell = row.insertCell();
            cell.innerHTML = "n/a";
          }
        }
      });
    });

    // create a button to reset the filter
    document.getElementById("output").innerHTML = "";
    var resetButton = document.createElement("button");
    resetButton.className = "reset btn btn-primary";
    resetButton.type = "button";
    resetButton.innerHTML = "Reset Filter";
    document.getElementById("output").appendChild(resetButton);

    // Append the table to the output element
    document.getElementById("output").appendChild(table);

    $(document).ready(function () {
      $("#data-table").tablesorter({
        theme: "bootstrap",
        widthFixed: true,
        widgets: ["filter", "columns", "zebra"],
        widgetOptions: {
          zebra: ["even", "odd"],
          columns: ["primary", "secondary", "tertiary"],
          filter_reset: ".reset",
          filter_placeholder: {
            search: "Filter...",
          },
          filter_hideFilters: true,
          filter_cssFilter: [
            "form-select",
            "form-select",
            "form-select",
            "form-select",
            "form-control-sm",
            "form-select",
            "form-control-sm",
          ], // TODO: create in loop
          filter_functions: {
            // TODO: create in loop
            0: true,
            1: true,
            2: true,
            3: true,
            5: true,
          },
        },
      });
    });
  } catch (error) {
    console.error("Fetch error:", error);
    document.getElementById("output").innerText = "Failed to load data.";
  }
}

var keyValues = [
  // todo: add form type for filter
  {
    name: "componenttype",
    display: "Component Type",
    type: "string",
    format: "strip",
    sub: { dsh: "Delegated Service Hub", ws: "Workload Spoke" },
  },
  {
    name: "componentType",
    display: "Component Type",
    type: "string",
    format: "strip",
    sub: { dsh: "Delegated Service Hub", ws: "Workload Spoke" },
  },
  { name: "region", display: "Region", type: "string", format: "toUpper" },
  { name: "tenant", display: "Tenant", type: "string", format: "toUpper" },
  {
    name: "env",
    display: "Environment",
    type: "string",
    format: "toUpper",
    sub: {
      dev: "Development",
      tst: "Test",
      pre: "Pre-Production",
      prd: "Production",
      srv: "Service",
    },
  },
  { name: "dateRequested", display: "Requested", type: "DateTime" },
  { name: "version", display: "Version", type: "string" },
  { name: "status", display: "Status", type: "string", format: "toUpper" },
  { name: "statusUpdated", display: "Last Updated", type: "DateTime" },
  { name: "id", display: "ID", type: "string", format: "toUpper" },
];

async function fetchUserInfo() {
  try {
    const response = await fetch("/.auth/me");
    const data = await response.json();
    const user = data.clientPrincipal;

    if (user) {
      document.getElementById("username-placeholder").textContent =
        user.userDetails;
      // document.getElementById("user-name").textContent = user.userDetails;
      // const rolesList = document.getElementById("user-roles");
      // user.userRoles.forEach((role) => {
      //   const li = document.createElement("li");
      //   li.textContent = role;
      //   rolesList.appendChild(li);
      // });
    }
  } catch (error) {
    console.error("Failed to fetch user info:", error);
  }
}

// Initialize
fetchUserInfo();

// Get URL parampulators
// var params = getUrlVars();
// let serviceName = params["service"];
// document.getElementById("service-heading").innerText =
//   serviceName.toUpperCase();
// // TODO: if no service is given then display a form to enter the service name (lookup if possible)
// fetchData();

function load() {
  const selectedService = document.getElementById("service-dropdown").value;
  if (selectedService !== "Select a service") {
    document.getElementById("output").innerHTML = "Loading...";
    serviceName = selectedService;
    document.getElementById("service-heading").innerText =
      serviceName.toUpperCase();
    fetchData();
  } else {
    alert("Please select a service.");
  }
}
