const BEEP = {
  action: 'stream',
  streamUrl: [`${process.env.HELPBOR_HOST}/beep.mp3`]
};

const nccoWelcome = [
  {
    action: 'talk',
    text: '<speak>' +
      '<p>Herzlich willkommen bei <phoneme alphabet="ipa" ph="hɛlpbər">helpbor</phoneme>, der freien Plattform für Nachbarschaftshilfe.</p>' +
      '</speak>',
    voiceName: 'Marlene',
    bargeIn: true
  }
];

const nccoLanguage = [
  {
    action: 'talk',
    text: '<speak>' +
      '<p>Für Deutsch drücken Sie bitte die Nummerntaste 2 auf Ihrem Telefon!</p>' +
      '</speak>',
    voiceName: 'Marlene',
    bargeIn: true
  }
];

const nccoRole = [
  {
    action: 'talk',
    text: '<speak>' +
      '<p>Möchten Sie eine Anfrage an die kleinen und grossen Helden in Ihrer Nachbarschaft aufgeben?</p>' +
      '<p>Dann drücken Sie bitte die Nummerntaste 1 auf Ihrem Telefon!</p>' +
      '<p>Oder möchten Sie gerne selbst ein <phoneme alphabet="ipa" ph="hɛlpbər">helpbor</phoneme>-Held oder Heldin sein?</p>' +
      '<p>Dann drücken Sie bitte die Nummerntaste 2 auf Ihrem Telefon!</p>' +
      '</speak>',
    voiceName: 'Marlene',
    bargeIn: true
  },
  {
    action: 'input',
    eventUrl: [`${process.env.HELPBOR_HOST}/vonage/role/de`],
    eventMethod: 'POST',
    submitOnHash: false,
    timeOut: 10,
    maxDigits: 1
  }
];

const nccoRepeat = [
  {
    action: 'talk',
    text: '<speak>' +
      '<p>Ich habe Ihre Auswahl leider nicht verstanden.</p>' +
      '<p>Bitte wählen Sie Ihre gewünschte Option über die Nummerntasten auf Ihrem Telefon!</p>' +
      '</speak>',
    voiceName: 'Marlene'
  }
];

const nccoRequest = [
  {
    action: 'talk',
    text: '<speak>' +
      '<p>Damit unsere <phoneme alphabet="ipa" ph="hɛlpbər">helpbor</phoneme>-Helden und Heldinnen zur Erledigung Ihrer Anfrage mit Ihnen in Kontakt treten können, benötigen wir einige wenige Informationen von Ihnen.</p>' +
      '</speak>',
    voiceName: 'Marlene'
  }
];

const nccoPhoneNumber = [
  {
    action: 'talk',
    text: '<speak>' +
      '<p>Sind sie unter dieser Telefonnummer von der aus Sie gerade anrufen später auch erreichbar?</p>' +
      '<p>Falls ja, drücken Sie bitte die Nummerntaste 1 und anschliessend die Raute-Taste auf Ihrem Telefon!</p>' +
      '<p>Falls nein, geben Sie bitte Ihre Telefonnummer für Rückfragen über die Nummerntasten Ihres Telefons ein!</p>' +
      '<p>Geben Sie die Telefonnummer bitte ohne Landesvorwahl ein!</p>' +
      '<p>Beenden Sie Ihre Eingabe mit der Raute-Taste.</p>' +
      '</speak>',
    voiceName: 'Marlene',
    bargeIn: true
  },
  {
    action: 'input',
    eventUrl: [`${process.env.HELPBOR_HOST}/vonage/phoneNumber/de`],
    eventMethod: 'POST',
    submitOnHash: true,
    timeOut: 10,
    maxDigits: 15
  }
]

const nccoName = [
  {
    action: 'talk',
    text: '<speak>Wie lautet Ihr Name? Bitte nennen Sie nach dem Signalton Ihren Vor- und Nachnamen.</speak>',
    voiceName: 'Marlene'
  },
  BEEP,
  {
    action: 'record',
    eventUrl: [`${process.env.HELPBOR_HOST}/vonage/name`],
    format: 'mp3',
    endOnSilence: 3
  }
]

const nccoZip = [
  {
    action: 'talk',
    text: '<speak>' +
      '<p>Zur Bestimmung Ihrer Nachbarschaft, benötigen wir nun noch ihre Postleitzahl.</p>' +
      '<p>Bitte geben Sie ihre Postleitzahl über die Nummerntasten Ihres Telefons ein.</p>' +
      '<p>Beenden Sie die Eingabe mit der Raute-Taste.</p>' +
      '</speak>',
    voiceName: 'Marlene',
    bargeIn: true
  },
  {
    action: 'input',
    eventUrl: [`${process.env.HELPBOR_HOST}/vonage/zipCode/de`],
    eventMethod: 'POST',
    submitOnHash: true,
    timeOut: 10,
    maxDigits: 5
  }
];

const nccoRequestType = [
  {
    action: 'talk',
    text: '<speak>' +
      '<p>Bei welcher Art von Anliegen benötigen Sie Unterstützung?</p>' +
      '<p>Benötigen Sie einige Lebensmittel oder andere Produkte aus dem Detailhandel, drücken Sie bitte die Nummerntaste 1 auf Ihrem Telefon!</p>' +
      '<p>Müssen Briefe oder Pakete bei der Postfiliale abgeholt werden, drücken Sie bitte die Nummerntaste 2 auf Ihrem Telefon!</p>' +
      '<p>Benötigen Sie etwas aus der Apotheke, drücken Sie bitte die Nummerntaste 3 auf Ihrem Telefon!</p>' +
      '<p>Soll Ihr Hund Gassi geführt werden, drücken Sie bitte die Nummerntaste 4 auf Ihrem Telefon!</p>' +
      '<p>Benötigen Sie einen Fahrdienst, drücken Sie bitte die Nummerntaste 5 auf Ihrem Telefon!</p>' +
      '<p>Haben Sie ein anderes Anliegen, drücken Sie bitte die Nummerntaste 9 auf Ihrem Telefon!</p>' +
      '</speak>',
    voiceName: 'Marlene',
    bargeIn: true
  },
  {
    action: 'input',
    eventUrl: [`${process.env.HELPBOR_HOST}/vonage/requestType/de`],
    eventMethod: 'POST',
    submitOnHash: true,
    timeOut: 10,
    maxDigits: 1
  }
];

const nccoRequestCustom = [
  {
    action: 'talk',
    text: '<speak>Okay, bitte erklären Sie Ihr Anliegen kurz in maximal zwei Minuten nach dem Signalton.</speak>',
    voiceName: 'Marlene'
  },
  BEEP,
  {
    action: 'record',
    eventUrl: [`${process.env.HELPBOR_HOST}/vonage/customRequest`],
    format: 'mp3',
    endOnSilence: 5
  }
];

const nccoNotifySummarize = [
  {
    action: 'notify',
    payload: {},
    eventUrl: [`${process.env.HELPBOR_HOST}/vonage/requestSummary/de`],
    eventMethod: 'POST'
  }
];

function nccoSummarizeRequest(conversationUUID: string, phoneNumber: string, zipCode: string, requestType: number) {
  let ncco = [
    {
      action: 'talk',
      text: '<speak>' +
        '<p>Ich fasse nun noch einmal Ihre Anfrage zusammen, bitte überprüfen Sie die Angaben.</p>' +
        '<p>Ist alles korrekt, dann drücken Sie bitte die Nummerntaste 1 auf Ihrem Telefon!</p>' +
        '<p>Hat sich irgendwo ein Fehler eingeschlichen, dann drücken Sie bitte die Nummerntaste 2 auf Ihrem Telefon!</p>' +
        '<p>Ihr Name lautet:</p>' +
        '</speak>',
      voiceName: 'Marlene'
    },
    {
      action: 'stream',
      streamUrl: [`${process.env.HELPBOR_HOST}/vonage/recording/${conversationUUID}/name`]
    },
    {
      action: 'talk',
      text: '<speak>' +
        `<p>Ihre Telefonnummer für Rückfragen lautet: <break time="1s" /> <prosody rate="slow"><say-as interpret-as="telephone">${phoneNumber}</say-as></prosody></p>` +
        `<p>Ihre Postleitzahl lautet: <break time="1s" /> <prosody rate="slow"><say-as interpret-as="telephone">${zipCode}</say-as></prosody></p>` +
        switchRequestType(requestType) +
        '</speak>',
      voiceName: 'Marlene'
    }
  ];

  if (requestType === 9) {
    ncco.push({
      action: 'stream',
      streamUrl: [`${process.env.HELPBOR_HOST}/vonage/recording/${conversationUUID}/customRequest`]
    });
  }

  return ncco;
}

function switchRequestType(requestType: number): string {
  let line = '<p>Sie benötigen Unterstützung ';

  switch (requestType) {
    case 1:
      line += 'bei Besorgungen aus dem Detailhandel';
      break;
    case 2:
      line += 'bei Briefen oder Paketen aus der Postfiliale';
      break;
    case 3:
      line += 'bei Besorgungen aus der Apotheke';
      break;
    case 4:
      line += 'beim Gassi führen Ihres Hundes';
      break;
    case 5:
      line += 'bei einer Fahrt';
      break;
    case 9:
      line += 'bei einer anderen Sache.</p><p>Sie haben diese wie folgt beschrieben:';
      break;
  }

  line += '</p>';
  return line;
}

export { nccoWelcome, nccoLanguage, nccoRequest, nccoRepeat, nccoRole, nccoPhoneNumber, nccoName, nccoZip, nccoSummarizeRequest, nccoRequestType, nccoRequestCustom, nccoNotifySummarize };