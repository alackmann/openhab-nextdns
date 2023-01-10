
const nextdns_apikey = '<add your apikey here>';
const nextdns_profile = '<put your profile here>';
const timeout = 3000;
const logger = log('nextdns');

rules.JSRule({
  name: "Check status of NextDNS Parental Controls",
  description: "",
  triggers: [triggers.GenericCronTrigger("0 * * * * ?")],
  tags: [],
  id: "NextDNS_ParentalControlsCheck",
  execute: (event) => {
    const url = `https://api.nextdns.io/profiles/${nextdns_profile}/parentalControl/services`;
    const headers = {
      'X-Api-Key': nextdns_apikey
    };
    var response = JSON.parse(actions.HTTP.sendHttpGetRequest(url, headers, timeout));
    // console.log(response);
    if(typeof response.data === 'object') {
      const rules = response.data;
      const itemMap = ['active','recreation']
      rules.forEach( (rule, i) => {
        logger.debug(`Found NextDNS rule for ${rule.id}`);
        itemMap.forEach( el => {
          var thisItemName = `NextDNS_${rule.id}_${el}`;
          var thisItem = items.getItem(thisItemName, true);
          commandToSend = (rule[el]) ? "ON" : "OFF";
          if(thisItem !== null) {
            logger.debug(`Updating ${thisItemName} to ${rule[el]}`);
            thisItem.postUpdate(commandToSend);
          } else {
            var label = "";
            switch(el) {
              case 'active' : label = `${rule.id} access enabled [%s]`; break;
              case 'recreation' : label = `${rule.id} recreation time enabled [%s]`; break;
            }
            var newItem = {
              type: "Switch",
              name: thisItemName,
              label: label,
              groups: ['NextDNS'],
              tags: ['NextDNS_ParentalControl_Service']
            }
            logger.info(`Item '${thisItemName}' not found. Creating it first...`);
            createdItem = items.addItem(newItem);
            createdItem.postUpdate(commandToSend);
          }
        })
      })
    }
  }
});

rules.JSRule({
  name: "Handle changes of NextDNS Parental Controls",
  description: "",
  triggers: [triggers.GroupCommandTrigger("NextDNS")],
  tags: [],
  id: "NextDNS_ParentalControlsChange",
  execute: (event) => {
    // get all items defined for NextDNS Parental Control Services
    const allItems = items.getItemsByTag('NextDNS_ParentalControl_Service');
    const allServices = {};
    // create an object keyed by the service name
    allItems.forEach( (pcsItem) => {
      // each item is named in the format NextDNS_servicename_attribute (eg. NextDNS_youtube_active)
      var itemNameSplit = pcsItem.name.split("_");
      var key = itemNameSplit[2];
      var val = (pcsItem.state === "ON") ? true : false;

      // initialise the object if it's not done so
      if(typeof allServices[itemNameSplit[1]] === 'undefined' ) {
        //initialise element
        var targetObj = {};
        allServices[itemNameSplit[1]] = {};
      } else {
        var targetObj = allServices[itemNameSplit[1]];
      }
      allServices[itemNameSplit[1]] = Object.assign(targetObj, {[key]: val} );
    });

    // ensure event data is applied (avoid race conditions)
    var eventItemNameSplit = event.itemName.split("_");
    allServices[eventItemNameSplit[1]][eventItemNameSplit[2]] = (event.receivedCommand == "ON") ? true : false; 
    
    // reformat into NextDNS format ready for API call
    var postData = Object.keys(allServices).map( service => {
      return Object.assign({
        id: service
      }, allServices[service])
    })

    // send PUT request to NextDNS with full payload for parentalControl/services
    // NOTE: This will overwrite anything configured in NextDNS, so OpenHAB Items must match!
    const url = `https://api.nextdns.io/profiles/${nextdns_profile}/parentalControl/services`;
    const headers = {
      'X-Api-Key': nextdns_apikey
    };
    actions.HTTP.sendHttpPutRequest(url, 'application/json', JSON.stringify(postData), headers, timeout);
    logger.info(`Updated NextDNS Parental Control for service ${eventItemNameSplit[1]}/${eventItemNameSplit[2]} to: ` + event.receivedCommand );
  }
});