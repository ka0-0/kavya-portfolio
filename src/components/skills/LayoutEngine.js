import { skillsData } from './data/skillsData';
import { layout } from './data/layout';
import { connections } from './data/connections';
import { themes } from './data/themes';

export const getLayoutData = (themeName = 'default') => {
  const selectedTheme = themes[themeName] || themes.default;
  const nodes = {};

  // 1. Position and bind node data
  Object.keys(layout.nodes).forEach((nodeId) => {
    const rawNode = skillsData[nodeId];
    const rawLayout = layout.nodes[nodeId];

    if (rawNode && rawLayout) {
      const themeToken = selectedTheme[rawNode.category] || {};
      nodes[nodeId] = {
        id: nodeId,
        name: rawNode.name,
        category: rawNode.category,
        type: rawNode.type,
        details: rawNode.details,
        position: rawLayout.position,
        visual: {
          ...rawLayout.visual,
          color: themeToken.primary || '#ffffff',
          nodeClass: themeToken.nodeClass || ''
        }
      };
    }
  });

  // 2. Prepare connection line definitions
  const resolvedConnections = connections.map((conn) => {
    const fromNode = nodes[conn.from];
    const toNode = nodes[conn.to];
    
    return {
      from: conn.from,
      to: conn.to,
      type: conn.type,
      style: conn.style,
      weight: conn.weight,
      startX: fromNode ? fromNode.position.x : 0,
      startY: fromNode ? fromNode.position.y : 0,
      endX: toNode ? toNode.position.x : 0,
      endY: toNode ? toNode.position.y : 0
    };
  });

  return {
    cx: layout.cx,
    cy: layout.cy,
    nodes,
    connections: resolvedConnections,
    theme: selectedTheme
  };
};
