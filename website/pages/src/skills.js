import { icon } from './common/wireframe.js?v=202610290503.37229b5005359dcaae1fd81b897a86a50da0f224';
import { addSlot } from './common/stage.js?v=202610290503.37229b5005359dcaae1fd81b897a86a50da0f224';

// x, y, z, size, color
const ICONS = {
  crane: [[0, -0.4, 0, 0.7, 0xf5a623], [0, 0.3, 0, 0.5, 0xf5a623], [0, 1.0, 0, 0.5, 0xf5a623], [-0.7, 0.7, 0, 0.9, 0xf5a623], [-1.1, 0.2, 0, 0.2, 0xd35400]],
  wrench: [[0, 0, 0, 0.8, 0x7f8c8d], [0.4, 0, 0, 0.5, 0x7f8c8d], [0.7, 0.3, 0, 0.5, 0x7f8c8d], [0.7, -0.3, 0, 0.5, 0x7f8c8d], [-0.4, 0, 0, 0.5, 0x95a5a6]],
  robot: [[0, 0.4, 0, 0.8, 0x3498db], [0, -0.3, 0, 0.9, 0x2980b9], [-0.3, 0.6, 0, 0.3, 0x3498db], [0.3, 0.6, 0, 0.3, 0xe74c3c], [0, 0, 0.5, 0.2, 0x2ecc71]],
  heart: [[-0.35, 0.2, 0, 0.6, 0xe74c3c], [0.35, 0.2, 0, 0.6, 0xe74c3c], [0, -0.1, 0, 0.9, 0xe74c3c], [0, -0.5, 0, 0.6, 0xe74c3c], [0, -0.8, 0, 0.3, 0xe74c3c]],
  grad: [[0, 0, 0, 0.8, 0x2c3e50], [0, 0.4, 0, 1.1, 0x2c3e50], [-0.8, 0.6, 0, 0.3, 0xf1c40f], [0, -0.4, 0, 0.5, 0x2c3e50], [0.4, 0.4, 0, 0.3, 0xf1c40f]],
  briefcase: [[0, -0.1, 0, 1, 0x34495e], [0, 0.4, 0, 0.6, 0x7f8c8d], [0, -0.3, 0.4, 0.2, 0x2c3e50], [0, 0, 0.5, 0.3, 0xf1c40f], [-0.4, 0.2, 0, 0.2, 0x7f8c8d]],
  money: [[0, 0, 0, 1, 0x27ae60], [0, -0.4, 0, 1, 0x2ecc71], [0.3, 0, 0.5, 0.3, 0xf1c40f], [-0.3, 0, 0.5, 0.3, 0xf1c40f], [0, 0, -0.3, 0.9, 0x2ecc71]]
};

const views = [];

function initSkills() {
  for (const [type, voxels] of Object.entries(ICONS)) {
    const canvas = document.querySelector(`canvas[data-icon="${type}"]`);
    if (canvas) views.push(addSlot(canvas, icon(voxels), { size: 64 }));
  }
}

initSkills();
window.sceneRegistry = window.sceneRegistry || {};
window.sceneRegistry['skills'] = {
  cleanup: () => views.splice(0).forEach((off) => off()),
  restart: initSkills
};
