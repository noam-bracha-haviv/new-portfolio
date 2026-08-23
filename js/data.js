/* ============================================================
   Hero Q&A content.
   Keys match the data-question / data-answer-for attributes in index.html.
   `answer`     — full text, kept for use elsewhere on the site.
   `heroAnswer` — shorter variant used by the hero card, which is a fixed
                  132px (4 lines) in Figma. js/main.js prefers heroAnswer
                  when present, otherwise it falls back to answer.
   ============================================================ */

window.QUESTIONS = [
  {
    id: 'q1',
    question: 'How do you approach projects?',
    heroAnswer: [
      "I always start with the problem. I enjoy researching, understanding people, exploring what already exists, and experiencing the challenge myself before I begin designing. Only once I truly understand the problem do I start thinking about solutions."
    ],
    answer: [
      "I always start with the problem. I enjoy researching, understanding people, exploring what already exists, and experiencing the challenge myself before I begin designing. Only after I truly understand the problem do I start thinking about solutions. Looking back at my projects, I realized they all began in the same place: with curiosity, research, and a desire to solve real problems."
    ]
  },
  {
    id: 'q2',
    question: 'How has industrial design shaped your thinking?',
    answer: [
      "My industrial design background shaped the way I think about design. It taught me to start with the problem, understand people and context, research, experiment, and iterate before arriving at the right solution. Moving into digital products changed the tools I use, but not the way I think."
    ]
  },
  {
    id: 'q3',
    question: 'What connects your projects?',
    heroAnswer: [
      "When I look back at my projects, I realize they all begin from the same place: real problems and the challenge of finding practical, meaningful solutions. Across healthcare, education, sustainability, and physical and digital products, my goal is always to make complex experiences simpler, clearer, and more accessible."
    ],
    answer: [
      "When I look back at my projects, I realize that although they span different fields, including healthcare, education, sustainability, and both physical and digital products, they all begin in the same place. I've always been drawn to real problems and the challenge of finding practical, meaningful solutions.",
      "Whether it was designing a portable toilet chair for a child with cerebral palsy, creating modular habitats for wild bees, designing a VR onboarding experience for older adults, or developing a language learning app through music, my goal has always been the same: to make complex experiences simpler, clearer, and more accessible.",
      "I didn't choose one industry. I chose a way of working. I'm drawn to real problems, and I believe research, empathy, and practical thinking lead to better solutions."
    ]
  },
  {
    id: 'q4',
    question: 'What do you enjoy most about product design?',
    answer: [
      "I enjoy the journey, from the curiosity that leads to research, to understanding a problem deeply and searching for the right solution. The most rewarding part is when a solution turns a complex experience into something simple, clear, and accessible for the people using it."
    ]
  },
  {
    id: 'q5',
    question: 'What did healthcare teach you?',
    answer: [
      "One of the biggest lessons I've learned is that great design isn't just about creating beautiful or functional interfaces. People need to feel confident, understand what's happening, and know what comes next. Especially in healthcare, I learned that trust and empathy are essential parts of the user experience. Even small design decisions can help build both."
    ]
  },
  {
    id: 'q6',
    question: 'What would surprise people about you?',
    heroAnswer: [
      "I learned English mostly through music. As a teenager I wrote song lyrics in Hebrew letters to understand their pronunciation and meaning. Years later that became the inspiration for Spello, a language learning app that teaches through music. And a fun fact: I also love 100% dark chocolate."
    ],
    answer: [
      "I learned English mostly through music. As a teenager, I used to write song lyrics in Hebrew letters to help myself understand their pronunciation and meaning. Years later, that experience became the inspiration for Spello, a language learning app that teaches through music.",
      "And as a fun fact, I also love 100% dark chocolate."
    ]
  }
];
