# openhab-nextdns
Javascript rules for [OpenHAB](https://www.openhab.org/) home automation to allow control of Parental Control rules managed in [NextDNS](https://nextdns.io/).

If (like me) you have a few cheeky little children using your internet, you might from time to time want to limit the services they can access. There are all sorts of ways to do this, but I've settled on using **NextDNS** to do DNS blocking on all the devices they use on a specific VLAN and WIFI SSID in my home. The details of that are beyond this script, but assuming you're also using NextDNS & OpenHAB this might be helpful! NextDNS gives you some handy tools to be able to block or allow all sorts of nasties, but I like to have a few rules for specific sites like YouTube or Snapchat to stop the kids wasting time.

![Next DNS Control Panel image](https://raw.githubusercontent.com/alackmann/openhab-nextdns/main/images/nextdns.png)

That's fine and all - but _sometimes_ you might want to be able to turn these rules off, either manually OR via some home automation rules. I like to have everything possible in OpenHAB so I don't need many different apps so, this is where this script comes in!

## What's in the box
Included here are two simple rules for OpenHAB:

1. A cron running every minutes to query NextDNS and synchronise any changes to the Parental Controls section down to your OpenHAB Items (including creating them if needed!)
2. A rule to respond to any changes you make to these items in OpenHAB and synnchronise them back to NextDNS so they take effect

## Prerequisites
* OpenHAB (Tested on 3.4.0)
* [JSScripting add-on](https://www.openhab.org/addons/automation/jsscripting/)

## Installation
* Download the `nextdns.js` file from this repository
* Edit the API credentials and profile values
  1. Edit the variable `nextdns_apikey`, replacing it with your NextDNS API key. You can find this on your Account page at the bottom of the page.
  2. Edit the variable `nextdns_profile`, replacing it with the ID of the profile you've setup for the location you want to manage your blocking. This is on the _Setup_ tab in the _Endpoints_ section and is labelled `ID` (hint: it's normally a 6 character string)
* BEFORE you install the file - create a new Group. Go to the OpenHAB Admin web-page, go to Items and create a new item of type _Group_. The item needs to be named `NextDNS`. (Alternatively, put the nextdns.items file from this repo in your _items_ configuration folder)
* Once you've edited the file, place it in your OpenHAB configuration folder in the `automation/js` sub-folder.

## Running

Once you have installed the `nextdns.js` file, within 1 minute, the script should access your NextDNS account and read any of the items you have configured in the Parental Controls "Websites, Apps & Games" section. 

For every service it finds, it will create 2 new Items in OpenHAB. eg. if you have a YouTube restriction like me, you'll get two new Switch Items:

1. `NextDNS_youtube_active` - a Switch that controls whether this rule is enabled or not
2. `NextDNS_youtube_recreation` - a Switch that controls whether the _Recreation Time_ settings in NextDNS Parental Controls should apply or not.

Anytime you add new services in NextDNS, you should very quickly get new Switch Items in OpenHAB. It will create a log entry anytime it creates these. 

## Removing a service from Next DNS
NOTE: If you remove services, it WILL not remove them again - in fact, it will create them next time you switch any of the NextDNS switches in OpenHAB. Sorry - OpenHAB doesn't support the HTTP PATCH method, so the only way to update these rules is as a HTTP PUT. 

In short - your OpenHAB is effectively the Master. If you want to remove some rules from both:
1. Pause the rule in the OpenHAB web interface
1. Delete the Items in OpenHAB
1. Delete the rule in NextDNS
1. Unpause the rule in OpenHAB

## Next Steps
Now that you have Switch Items (which all have the `NextDNS` Group BTW), you can add them to your [Sitemaps](https://www.openhab.org/docs/ui/sitemaps.html) or [Layouts](https://www.openhab.org/docs/ui/layout-pages.html) as you see fit.

![OpenHAB Sitemap example](https://raw.githubusercontent.com/alackmann/openhab-nextdns/main/images/sitemap.png)

Feel free to edit the Items to your own preferences. The script won't make any further changes after creating them for you in the first place. The critical information is the `name` value which is not editable after creation and the type (don't change it from Switch to anything else - that's just going to break things)










