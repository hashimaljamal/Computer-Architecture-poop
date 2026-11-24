/*
 * curriculum.js - which lessons belong to which exam, and which practice tab belongs to which lesson.
 * Edit this file to change the Mid 1 / Mid 2 / Final buttons or to add a lecture.
 *
 *   EXAMS    the exam buttons, in order
 *   TOPICS   every lesson (lecture), in course order; exams = the exams it is on
 *   PRACTICE practice tab id -> lesson id (a tab is shown when its lesson is switched on)
 */
window.Curriculum = {
  EXAMS: [
    { id: 'mid1', title: 'Mid 1' },
    { id: 'mid2', title: 'Mid 2' },
    { id: 'final', title: 'Final' }
  ],
  TOPICS: [
    { id: 'l1', title: 'Lecture 1', exams: ['mid1'] },
    { id: 'l2', title: 'Lecture 2', exams: ['mid1'] },
    { id: 'l3', title: 'Lecture 3', exams: ['mid1'] },
    { id: 'l4', title: 'Lecture 4', exams: ['mid1'] },
    { id: 'l5', title: 'Lecture 5', exams: ['mid1'] },
    { id: 'l6', title: 'Lecture 6: LC-3 assembly', exams: ['mid1', 'final'] },
    { id: 'l7', title: 'Lecture 7: LC-3 assembly', exams: ['final'] },
    { id: 'isa', title: 'Instruction Set Encoding', exams: ['mid2'] },
    { id: 'pipe', title: 'Pipelining', exams: ['mid2'] },
    { id: 'mem', title: 'Lecture 11: Memory System Design', exams: ['mid2', 'final'] },
    { id: 'cache', title: 'Lecture 12: Cache', exams: ['mid2', 'final'] },
    { id: 'io', title: 'Lecture 13: I/O Systems', exams: ['final'] },
    { id: 'multicore', title: 'Multicore', exams: [] },
    { id: 'alu', title: 'Lecture 15: ALU', exams: ['final'] }
  ],
  PRACTICE: {
    'lc3-encoding': 'isa', 'pipelining': 'pipe', 'memory-design': 'mem', 'cache': 'cache',
    'io-systems': 'io', 'multicore': 'multicore', 'alu': 'alu'
  }
};
