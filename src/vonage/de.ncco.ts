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
    eventUrl: [`${process.env.HELPBOR_HOST}/vonage/role`],
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
      '<p>Falls ja, drücken Sie bitte die Nummerntaste 1 auf Ihrem Telefon!</p>' +
      '<p>Falls nein, geben Sie bitte Ihre Telefonnummer für Rückfragen über die Nummerntasten Ihres Telefons ein!</p>' +
      '<p>Geben Sie die Telefonnummer bitte ohne Landesvorwahl ein!</p>' +
      '<p>Beenden Sie die Eingabe mit der Raute-Taste.</p>' +
      '</speak>',
    voiceName: 'Marlene',
    bargeIn: true
  },
  {
    action: 'input',
    eventUrl: [`${process.env.HELPBOR_HOST}/vonage/phoneNumber`],
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
    endOnSilence: 3,
    timeOut: 15
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
    eventUrl: [`${process.env.HELPBOR_HOST}/vonage/zipCode`],
    eventMethod: 'POST',
    submitOnHash: true,
    timeOut: 10,
    maxDigits: 5
  }
]

const nccoRequestType = [
  {
    action: 'talk',
    text: '<speak>' +
      '<p>Bei welcher Art von Anliegen benötigen Sie Unterstützung?</p>' +
      '<p>Benötigen Sie einige Lebensmittel aus dem Detailhandel, drücken Sie bitte die Nummerntaste 1 auf Ihrem Telefon!</p>' +
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
    eventUrl: [`${process.env.HELPBOR_HOST}/vonage/requestType`],
    eventMethod: 'POST',
    submitOnHash: true,
    timeOut: 10,
    maxDigits: 1
  }
]

const nccoRequestCustom = [
  {
    action: 'talk',
    text: '<speak>' +
      '<p>Okay, kein Problem!</p>' +
      '<p>Bitte erklären Sie Ihr Anliegen für die Helfer kurz in maximal einer Minute nach dem Signalton.</p>' +
      '</speak>',
    voiceName: 'Marlene',
    bargeIn: true
  },
  BEEP,
  {
    action: 'record',
    eventUrl: [`${process.env.HELPBOR_HOST}/vonage/customRequest`],
    format: 'mp3',
    endOnSilence: 3,
    timeOut: 60
  }
]

const nccoSummarizeRequest = (nameAudioUrl: string, phoneNumber: string, zipCode: string) => [
  {
    action: 'talk',
    text: '<speak>' +
      '<p>Ich fasse nun noch einmal Ihre Anfrage zusammen, bitte überprüfen Sie die Angaben.</p>' +
      '<p>Ist alles korrekt, dann drücken Sie bitte nach dem Signalton die Nummerntaste 1 auf Ihrem Telefon!</p>' +
      '<p>Hat sich irgendwo ein Fehler eingeschlichen, dann drücken Sie bitte nach dem Signalton die Nummerntaste 2 auf Ihrem Telefon!</p>' +
      '<p>Ihr Name lautet:</p>' +
      '</speak>',
    voiceName: 'Marlene'
  },
  {
    action: 'stream',
    streamUrl: [nameAudioUrl]
  },
  {
    action: 'talk',
    text: '<speak>' +
      `<p>Ihre Telefonnummer für Rückfragen lautet: <break time="1s" /> <prosody rate="slow"><say-as interpret-as="telephone">${phoneNumber}</say-as></prosody></p>` +
      `<p>Ihre Postleitzahl lautet: <break time="1s" /> <prosody rate="slow"><say-as interpret-as="telephone">${zipCode}</say-as></prosody></p>` +
      '</speak>',
    voiceName: 'Marlene'
  }
];

export { nccoWelcome, nccoRequest, nccoRepeat, nccoRole, nccoPhoneNumber, nccoName, nccoZip, nccoSummarizeRequest };