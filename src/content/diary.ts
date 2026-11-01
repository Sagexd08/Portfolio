// Diary content. Journal text comes from Sohom's own description; videos were each checked against YouTube's oEmbed
// endpoint; IoT photos are credited stock images from Wikimedia Commons (not Sohom's own builds).

export interface JournalEntry {
  title: string;
  body: string;
}

export const JOURNAL: readonly JournalEntry[] = [
  {
    title: 'It started at 16',
    body: 'I started coding when I was 16 years old. Since then I have picked up Rust, TypeScript, JavaScript and Python, among other languages, and I keep choosing the one that fits the problem rather than the one I already know.',
  },
  {
    title: 'What I like building',
    body: 'Production ML and the systems around it: document extraction, scoring, agent memory, and tools that people actually use. The projects in this portfolio are the real ones; open the Projects app to see them.',
  },
  {
    title: 'IoT, the tinkering side',
    body: 'I also like working on IoT: boards, sensors and small devices that talk to software. I do not photograph that work, so the pictures in the IoT tab are credited stock photos of the kind of hardware I enjoy, not my own builds.',
  },
  {
    title: 'How I learn',
    body: 'I learn by watching people explain things from first principles (3Blue1Brown, Andrej Karpathy) and by reading how experienced engineers think about design and reverse engineering, including Linus Torvalds writing about taste in code.',
  },
];

export interface Video {
  id: string;
  title: string;
  channel: string;
}

export const WATCHLIST: readonly { heading: string; videos: readonly Video[] }[] = [
  {
    heading: '3Blue1Brown: neural networks',
    videos: [
      { id: 'aircAruvnKk', title: 'But what is a neural network?', channel: '3Blue1Brown' },
      { id: 'IHZwWFHWa-w', title: 'Gradient descent, how neural networks learn', channel: '3Blue1Brown' },
      { id: 'Ilg3gGewQ5U', title: 'Backpropagation, intuitively', channel: '3Blue1Brown' },
      { id: 'tIeHLnjs5U8', title: 'Backpropagation calculus', channel: '3Blue1Brown' },
      { id: 'wjZofJX0v4M', title: 'Transformers, the tech behind LLMs', channel: '3Blue1Brown' },
      { id: 'eMlx5fFNoYc', title: 'Attention in transformers, step-by-step', channel: '3Blue1Brown' },
      { id: '9-Jl0dxWQs8', title: 'How might LLMs store facts', channel: '3Blue1Brown' },
    ],
  },
  {
    heading: 'Andrej Karpathy: build it from scratch',
    videos: [
      { id: 'VMj-3S1tku0', title: 'Building micrograd: neural networks and backpropagation', channel: 'Andrej Karpathy' },
      { id: 'PaCmpygFfXo', title: 'Building makemore: language modeling', channel: 'Andrej Karpathy' },
      { id: 'kCc8FmEb1nY', title: "Let's build GPT: from scratch, in code", channel: 'Andrej Karpathy' },
      { id: 'zduSFxRajkE', title: "Let's build the GPT Tokenizer", channel: 'Andrej Karpathy' },
      { id: 'l8pRSuU81PU', title: "Let's reproduce GPT-2 (124M)", channel: 'Andrej Karpathy' },
      { id: '7xTGNNLPyMI', title: 'Deep Dive into LLMs like ChatGPT', channel: 'Andrej Karpathy' },
      { id: 'EWvNQjAaOHw', title: 'How I use LLMs', channel: 'Andrej Karpathy' },
    ],
  },
  {
    heading: 'Linus Torvalds',
    videos: [{ id: 'o8NPllzkFhE', title: 'The Mind Behind Linux', channel: 'TED' }],
  },
];

export interface Reading {
  title: string;
  by: string;
  url: string;
  why: string;
}

export const READING: readonly Reading[] = [
  { title: 'Linux kernel coding style', by: 'Linux kernel docs (Linus Torvalds and contributors)', url: 'https://www.kernel.org/doc/html/latest/process/coding-style.html', why: 'Opinionated design taste, written down plainly.' },
  { title: 'Linux Kernel Mailing List archive', by: 'lkml.org', url: 'https://lkml.org/', why: 'Where kernel design arguments, reviews and reverse-engineering style debugging happen in public.' },
  { title: 'A Recipe for Training Neural Networks', by: 'Andrej Karpathy', url: 'https://karpathy.github.io/2019/04/25/recipe/', why: 'A calm, practical way to approach model training.' },
  { title: "Andrej Karpathy's blog", by: 'Andrej Karpathy', url: 'https://karpathy.github.io/', why: 'Clear writing on deep learning and how software changes with it.' },
];

export interface IotPhoto {
  file: string;
  title: string;
  artist: string;
  license: string;
  page: string;
}

export const IOT_PHOTOS: readonly IotPhoto[] = [
  { file: 'raspberry-pi-4.webp', title: 'Raspberry Pi 4 Model B', artist: 'Laserlicht', license: 'CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:Raspberry_Pi_4_Model_B_-_Side.jpg' },
  { file: 'esp32-dev-board.webp', title: 'ESP32 development board', artist: 'Edwiyanto', license: 'CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:ESP32_Dev_Board.jpg' },
  { file: 'breadboard-4008b.webp', title: 'Breadboard prototype', artist: 'Eeppeliteloop', license: 'CC BY-SA 3.0', page: 'https://commons.wikimedia.org/wiki/File:Breadboard_with_4008B.jpg' },
  { file: 'dht22-sensor.webp', title: 'DHT22 temperature and humidity sensor', artist: 'Suyash Dwivedi', license: 'CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:DHT22_digital_temperature_and_humidity_sensor_module_pcb.jpg' },
  { file: 'reflow-oven.webp', title: 'Reflow oven', artist: 'Nelatan', license: 'CC BY-SA 3.0', page: 'https://commons.wikimedia.org/wiki/File:Reflow_oven.jpg' },
];
