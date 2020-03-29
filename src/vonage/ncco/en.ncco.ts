const BEEP = {
  action: 'stream',
  streamUrl: [`${process.env.HELPBOR_HOST}/beep.mp3`]
};

const nccoWelcome = [
  {
    action: 'talk',
    text: '<speak>' +
      '<p>Welcome to <phoneme alphabet="ipa" ph="hɛlpbər">helpbor</phoneme>, your free platform for neighbourly help.</p>' +
      '</speak>',
    voiceName: 'Salli',
    bargeIn: true
  }
];

const nccoLanguage = [
  {
    action: 'talk',
    text: '<speak>' +
      '<p>For English please press the number key 1 on your phone!</p>' +
      '</speak>',
    voiceName: 'Salli',
    bargeIn: true
  }
];

const nccoRole = [
  {
    action: 'talk',
    text: '<speak>' +
      '<p>Would you like to make an request to the big and small heroes in your neighborhood?</p>' +
      '<p>Then please press the number key 1 on your phone!</p>' +
      '<p>Or would you like to be a <phoneme alphabet="ipa" ph="hɛlpbər">helpbor</phoneme> hero yourself?</p>' +
      '<p>Then please press number key 2 on your phone!</p>' +
      '</speak>',
    voiceName: 'Salli',
    bargeIn: true
  },
  {
    action: 'input',
    eventUrl: [`${process.env.HELPBOR_HOST}/vonage/role/en`],
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
      '<p>Unfortunately I did not understand your selection.</p>' +
      '<p>Please select your desired option using the number buttons on your phone!</p>' +
      '</speak>',
    voiceName: 'Salli'
  }
];

const nccoRequest = [
  {
    action: 'talk',
    text: '<speak>' +
      '<p>We need a little information from you so that our <phoneme alphabet="ipa" ph="hɛlpbər">helpbor</phoneme> heroes and heroines can get in touch with you to deal with your request.</p>' +
      '</speak>',
    voiceName: 'Salli'
  }
];

const nccoPhoneNumber = [
  {
    action: 'talk',
    text: '<speak>' +
      '<p>Can you also be reached later on this telephone number from which you are calling?</p>' +
      '<p>If so, please press number key 1 and then the hash key on your phone!</p>' +
      '<p>If not, please enter your telephone number for queries using the number keys on your telephone!</p>' +
      '<p>Please enter the phone number without country code!</p>' +
      '<p>End your entry with the hash key.</p>' +
      '</speak>',
    voiceName: 'Salli',
    bargeIn: true
  },
  {
    action: 'input',
    eventUrl: [`${process.env.HELPBOR_HOST}/vonage/phoneNumber/en`],
    eventMethod: 'POST',
    submitOnHash: true,
    timeOut: 10,
    maxDigits: 15
  }
]

const nccoName = [
  {
    action: 'talk',
    text: '<speak>What is your name? Please give your first and last name after the beep.</speak>',
    voiceName: 'Salli'
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
      '<p>To determine your neighborhood, we now need your postal code.</p>' +
      '<p>Please enter your zip code using the number keys on your phone.</p>' +
      '<p>End the entry with the hash key.</p>' +
      '</speak>',
    voiceName: 'Salli',
    bargeIn: true
  },
  {
    action: 'input',
    eventUrl: [`${process.env.HELPBOR_HOST}/vonage/zipCode/en`],
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
      '<p>What kind of request do you need support for?</p>' +
      '<p>If you need some groceries or other retail products, please press the number key 1 on your phone!</p>' +
      '<p>If letters or parcels have to be picked up at the post office, please press number key 2 on your phone!</p>' +
      '<p>If you need anything from the pharmacy, please press the number key 3 on your phone!</p>' +
      '<p>If you want your dog to be walked, please press the number key 4 on your phone!</p>' +
      '<p>If you need a car service, please press the number key 5 on your phone!</p>' +
      '<p>If you have an other request, please press the number key 9 on your phone!</p>' +
      '</speak>',
    voiceName: 'Salli',
    bargeIn: true
  },
  {
    action: 'input',
    eventUrl: [`${process.env.HELPBOR_HOST}/vonage/requestType/en`],
    eventMethod: 'POST',
    submitOnHash: true,
    timeOut: 10,
    maxDigits: 1
  }
];

const nccoRequestCustom = [
  {
    action: 'talk',
    text: '<speak>Okay, please explain your concerns briefly in a maximum of two minutes after the beep.</speak>',
    voiceName: 'Salli'
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
    eventUrl: [`${process.env.HELPBOR_HOST}/vonage/requestSummary/en`],
    eventMethod: 'POST'
  }
];

function nccoSummarizeRequest(conversationUUID: string, phoneNumber: string, zipCode: string, requestType: number) {
  let ncco = [
    {
      action: 'talk',
      text: '<speak>' +
        '<p>I will now summarize your request again, please check the information.</p>' +
        '<p>If everything is correct, please press number key 1 on your phone!</p>' +
        '<p>If an error has crept in somewhere, please press number key 2 on your phone!</p>' +
        '<p>Your name is:</p>' +
        '</speak>',
      voiceName: 'Salli'
    },
    {
      action: 'stream',
      streamUrl: [`${process.env.HELPBOR_HOST}/vonage/recording/${conversationUUID}/name`]
    },
    {
      action: 'talk',
      text: '<speak>' +
        `<p>Your telephone number for further inquiry is: <break time="1s" /> <prosody rate="slow"><say-as interpret-as="telephone">${phoneNumber}</say-as></prosody></p>` +
        `<p>Your postal code is: <break time="1s" /> <prosody rate="slow"><say-as interpret-as="telephone">${zipCode}</say-as></prosody></p>` +
        switchRequestType(requestType) +
        '</speak>',
      voiceName: 'Salli'
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
  let line = '<p>You need support ';

  switch (requestType) {
    case 1:
      line += 'with errands from the retail trade';
      break;
    case 2:
      line += 'with letters or parcels from the post office';
      break;
    case 3:
      line += 'with errands from the pharmacy';
      break;
    case 4:
      line += 'in taking your dog for a walk';
      break;
    case 5:
      line += 'with a ride';
      break;
    case 9:
      line += 'with something else.</p><p>You described them as follows:';
      break;
  }

  line += '</p>';
  return line;
}

export { nccoWelcome, nccoLanguage, nccoRequest, nccoRepeat, nccoRole, nccoPhoneNumber, nccoName, nccoZip, nccoSummarizeRequest, nccoRequestType, nccoRequestCustom, nccoNotifySummarize };