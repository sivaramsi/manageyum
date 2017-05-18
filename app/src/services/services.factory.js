angular.module('puraApp').factory('Services', Services)

function Services(localStorageService) {
    // let sampleServiceSchema = {
    //         name:'',
    //         id:0,
    //         baseURL:'',
    //         isSubdomain:false,
    //         has_notification:false
    // }
    let trello = {
        name: 'trello',
        id: 1,
        baseURL: 'https://trello.com/',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: 'true'
    };

    let asana = {
        name: 'asana',
        id: 2,
        baseURL: 'https://app.asana.com/',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: 'true',
        custom_badges: [{ name: 'Alert', entity: 'title' }]
    }

    let slack = {
        name: 'slack',
        id: 3,
        baseURL: '.slack.com',
        isSubdomain: true,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true
    }

    let whatsapp = {
        name: 'whatsapp',
        id: 4,
        baseURL: 'https://web.whatsapp.com',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true
    }

    let olark = {
        name: 'olark',
        id: 5,
        baseURL: 'https://www.olark.com/account/login',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true
    }


    let intercom = {
        name: 'intercom',
        id: 6,
        baseURL: 'https://app.intercom.io/admins/sign_in',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: 'true',
        custom_badges: [{ name: 'conversations', entity: 'conversations' }]
    }


    let tweetdeck = {
        name: 'tweetdeck',
        id: 7,
        baseURL: 'https://tweetdeck.twitter.com/',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true
    }

    let linkedin = {
        name: 'linkedin',
        id: 8,
        baseURL: 'https://www.linkedin.com/',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true
    }

    let zendesk = {
        name: 'zendesk',
        id: 9,
        baseURL: '.zendesk.com',
        has_custom_url: true,
        isSubdomain: true,
        has_notification: false,
        logo_ext: 'svg',
        has_preloader: true
    }

    let freshdesk = {
        name: 'freshdesk',
        id: 10,
        baseURL: '.freshdesk.com',
        isSubdomain: true,
        has_notification: false,
        logo_ext: 'png',
        has_preloader: 'true'
    }

    let gmail = {
        name: 'gmail',
        id: 11,
        baseURL: 'https://mail.google.com/mail/u/0/#inbox',
        isSubdomain: false,
        has_notification: false,
        logo_ext: 'svg',
        has_preloader: true
    }

    let pura = {
        name: 'pura',
        id: 12,
        baseURL: 'https://app.pura.im/',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'png',
        has_preloader: true
    }

    let messenger = {
        name: 'messenger',
        id: 13,
        baseURL: 'https://www.messenger.com/',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true
    }

    let skype = {
        name: 'skype',
        id: 14,
        baseURL: 'https://web.skype.com',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true
    }


    let telegram = {
        name: 'telegram',
        id: 15,
        baseURL: 'https://web.telegram.org/#/im',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true
    }

    let twitter = {
        name: 'twitter',
        id: 15,
        baseURL: 'https://twitter.com',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true
    }


    let gitter = {
        name: 'gitter',
        id: 16,
        baseURL: 'https://gitter.im/home/explore',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true
    }


    let outlook = {
        name: 'outlook',
        id: 17,
        baseURL: 'https://outlook.live.com/owa/',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true
    }

    let github = {
        name: 'github',
        id: 18,
        baseURL: 'https://github.com',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'png',
        has_preloader: true
    }

    let bitbucket = {
        name: 'bitbucket',
        id: 19,
        baseURL: 'https://bitbucket.org',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true
    }

    let helpscout = {
        name: 'helpscout',
        id: 20,
        baseURL: 'https://secure.helpscout.net/dashboard/',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true,
        custom_badges: [{ name: 'assigned', entity: 'assigned' }, { name: 'unassigned', entity: 'unassigned' }, { name: 'mine', entity: 'mine' }]
    }


    let hipchat = {
        name: 'hipchat',
        id: 21,
        has_custom_url: true,
        baseURL: '.hipchat.com',
        isSubdomain: true,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true
    }

    let teamwork = {
        name: 'teamwork',
        id: 22,
        baseURL: '.teamwork.com',
        isSubdomain: true,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true,
        custom_badges: [{ name: 'notification icon', entity: 'app_unread_count' }]
    }

    let closeio = {
        name: 'closedotio',
        id: 23,
        baseURL: 'https://app.close.io',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true
    }

    let salesforce = {
        name: 'salesforce',
        id: 24,
        baseURL: 'https://ap2.lightning.force.com/one/one.app',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true
    }

    let hangouts = {
        name: 'hangouts',
        id: 25,
        baseURL: 'https://hangouts.google.com/',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true
    }

    let productHunt = {
        name: 'producthunt',
        id: 26,
        baseURL: 'https://producthunt.com',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'png',
        has_preloader: true
    }

    let inbox = {
        name: 'inbox',
        id: 27,
        baseURL: 'https://inbox.google.com/',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true
    }

    let google_calendar = {
        name: 'google_calendar',
        id: 28,
        baseURL: 'https://calendar.google.com/calendar/render',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'png',
        has_preloader: true
    }

    let evernote = {
        name: 'evernote',
        id: 29,
        baseURL: 'https://www.evernote.com/Home.action',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'png',
        has_preloader: true
    }

    let basecamp = {
        name: 'basecamp',
        id: 30,
        baseURL: 'https://launchpad.37signals.com/',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'png',
        has_preloader: true
    }


    let todoist = {
        name: 'todoist',
        id: 31,
        baseURL: 'https://en.todoist.com/app',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'png',
        has_preloader: true,
        custom_badges: [{ name: 'Inbox', entity: 'filter_inbox', type: 'id' }, { name: 'Today', entity: 'filter', type: 'class', index: 2 }]
    }

    let wunderlist = {
        name: 'wunderlist',
        id: 32,
        baseURL: 'https://www.wunderlist.com/webapp',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'png',
        has_preloader: true,
        custom_badges: [{ name: 'inbox', entity: 'inbox' }]
    }

    let google_drive = {
        name: 'google_drive',
        id: 33,
        baseURL: 'https://drive.google.com/drive/my-drive',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'png',
        has_preloader: true
    }

    let jira = {
        name: 'jira',
        id: 34,
        baseURL: '.atlassian.net/',
        isSubdomain: true,
        has_notification: true,
        logo_ext: 'png',
        has_preloader: true
    }

    let confluence = {
        name: 'confluence',
        id: 35,
        baseURL: '.atlassian.net/',
        isSubdomain: true,
        has_notification: true,
        logo_ext: 'png',
        has_preloader: true
    }

    let hubspot = {
        name: 'hubspot',
        id: 36,
        baseURL: 'https://app.hubspot.com',
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true
    }

    let custom = {
        name: 'custom_app',
        id: 37,
        baseURL: 'https://yourcustomapp.com',
        is_custom_app: true,
        isSubdomain: false,
        has_notification: true,
        logo_ext: 'svg',
        has_preloader: true
    }

    let services = [trello, asana, slack, whatsapp, olark, intercom, tweetdeck, linkedin, zendesk, freshdesk, gmail, pura, messenger, skype, telegram, twitter, gitter, outlook, github, bitbucket, helpscout, hipchat, teamwork, closeio, salesforce, hangouts, productHunt, inbox, google_calendar, evernote, basecamp, todoist, wunderlist, google_drive, jira, confluence, hubspot, custom];

    return {
        get: function() {
            return services;
        }
    }
}
