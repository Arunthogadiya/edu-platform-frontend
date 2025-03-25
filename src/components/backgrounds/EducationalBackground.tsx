import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const EducationalBackground: React.FC = () => {
  // Generate dynamic positions for elements that change on each render
  const generateRandomPositions = (count: number, margin: number = 10) => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * (100 - margin * 2) + margin,
      y: Math.random() * (100 - margin * 2) + margin,
    }));
  };
  
  // Use useMemo to ensure positions don't change on every re-render
  const mathPositions = useMemo(() => generateRandomPositions(7), []);
  const shapePositions = useMemo(() => generateRandomPositions(5), []);
  const instrumentPositions = useMemo(() => generateRandomPositions(4), []);
  const elementPositions = useMemo(() => generateRandomPositions(4), []);

  // Mathematical formulas with more dynamic positioning
  const mathElements = [
    { content: "E = mc²", size: "1.2rem", rotate: -5 },
    { content: "∫f(x)dx", size: "1.2rem", rotate: 5 },
    { content: "a² + b² = c²", size: "1.2rem", rotate: 0 },
    { content: "F = ma", size: "1.3rem", rotate: -3 },
    { content: "PV = nRT", size: "1.2rem", rotate: 2 },
    { content: "Σ F = 0", size: "1.1rem", rotate: 0 },
    { content: "y = mx + b", size: "1.2rem", rotate: -2 }
  ].map((el, i) => ({
    ...el,
    id: i,
    x: `${mathPositions[i].x}%`,
    y: `${mathPositions[i].y}%`
  }));

  // Geometric shapes with dynamic positioning
  const shapes = [
    { type: "triangle", size: 40, fill: "rgba(99, 102, 241, 0.1)", stroke: "rgba(99, 102, 241, 0.2)" },
    { type: "circle", radius: 30, fill: "rgba(139, 92, 246, 0.1)", stroke: "rgba(139, 92, 246, 0.2)" },
    { type: "rect", width: 50, height: 40, fill: "rgba(236, 72, 153, 0.1)", stroke: "rgba(236, 72, 153, 0.2)" },
    { type: "hexagon", size: 30, fill: "rgba(79, 70, 229, 0.1)", stroke: "rgba(79, 70, 229, 0.2)" },
    { type: "diamond", size: 35, fill: "rgba(52, 211, 153, 0.1)", stroke: "rgba(52, 211, 153, 0.2)" }
  ].map((shape, i) => ({
    ...shape,
    id: i,
    x: shapePositions[i].x * 10,
    y: shapePositions[i].y * 5
  }));

  // Scientific instruments with dynamic positioning
  const scientificInstruments = [
    { type: "microscope", size: 0.8 },
    { type: "flask", size: 0.9 },
    { type: "telescope", size: 0.7 },
    { type: "compass", size: 0.7 }
  ].map((instrument, i) => ({
    ...instrument,
    id: i,
    x: instrumentPositions[i].x * 10,
    y: instrumentPositions[i].y * 5
  }));

  // Periodic table elements with dynamic positioning
  const periodicElements = [
    { symbol: "", color: "rgba(142, 181, 228, 0.3)" },
    { symbol: "", color: "rgba(206, 164, 164, 0.3)" },
    { symbol: "", color: "rgba(137, 168, 157, 0.3)" },
    { symbol: "", color: "rgba(179, 168, 212, 0.3)" }
  ].map((element, i) => ({
    ...element,
    id: i,
    x: elementPositions[i].x * 10,
    y: elementPositions[i].y * 5
  }));

  // Generate connections between elements
  const moleculeConnections = useMemo(() => {
    const connections = [];
    for (let i = 0; i < periodicElements.length; i++) {
      for (let j = i + 1; j < periodicElements.length; j++) {
        if (Math.random() < 0.6) { // 50% chance to create connection
          connections.push({
            id: `${i}-${j}`,
            x1: periodicElements[i].x,
            y1: periodicElements[i].y,
            x2: periodicElements[j].x,
            y2: periodicElements[j].y,
            color: "rgba(255, 255, 255, 0.2)"
          });
        }
      }
    }
    return connections;
  }, [periodicElements]);

  // Generate random AI nodes for network visualization
  const generateAINodes = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5
    }));
  };

  const aiNodes = useMemo(() => generateAINodes(40), []);
  
  // Generate connections between AI nodes
  const aiConnections = useMemo(() => {
    const connections = [];
    for (let i = 0; i < aiNodes.length; i++) {
      // Connect each node to 1-3 other nodes
      const connectionCount = Math.floor(Math.random() * 3) + 1;
      for (let c = 0; c < connectionCount; c++) {
        const targetIndex = Math.floor(Math.random() * aiNodes.length);
        if (targetIndex !== i) {
          connections.push({
            id: `${i}-${targetIndex}`,
            source: aiNodes[i],
            target: aiNodes[targetIndex],
            opacity: Math.random() * 0.15 + 0.05
          });
        }
      }
    }
    return connections;
  }, [aiNodes]);

  const renderShape = (shape: any) => {
    switch(shape.type) {
      case 'triangle':
        return (
          <polygon 
            points={`0,-${shape.size/2} ${shape.size/2},${shape.size/2} -${shape.size/2},${shape.size/2}`}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth="0.5"
          />
        );
      case 'circle':
        return (
          <circle 
            r={shape.radius} 
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth="0.5"
          />
        );
      case 'rect':
        return (
          <rect 
            x={-shape.width/2}
            y={-shape.height/2}
            width={shape.width}
            height={shape.height}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth="0.5"
          />
        );
      case 'hexagon':
        const hexPoints = Array.from({length: 6}).map((_, i) => {
          const angle = (Math.PI / 3) * i;
          return `${shape.size * Math.cos(angle)},${shape.size * Math.sin(angle)}`;
        }).join(' ');
        return (
          <polygon 
            points={hexPoints}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth="0.5"
          />
        );
      case 'diamond':
        return (
          <polygon 
            points={`0,-${shape.size/2} ${shape.size/2},0 0,${shape.size/2} -${shape.size/2},0`}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth="0.5"
          />
        );
      default:
        return null;
    }
  };

  const renderScientificInstrument = (instrument: any) => {
    switch(instrument.type) {
      case 'microscope':
        return (
          <g transform={`scale(${instrument.size})`}>
            <path 
              d="M0,0 L-5,-20 L5,-20 L0,0 Z M-8,-20 L8,-20 L10,-25 L-10,-25 Z M-2,-25 L2,-25 L2,-45 L-2,-45 Z" 
              fill="none" 
              stroke="rgba(255, 255, 255, 0.2)" 
              strokeWidth="1"
            />
            <circle cx="0" cy="-40" r="4" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
          </g>
        );
      case 'flask':
        return (
          <g transform={`scale(${instrument.size})`}>
            <path 
              d="M-3,-30 L-3,-15 L-15,10 L15,10 L3,-15 L3,-30 Z" 
              fill="rgba(167, 139, 250, 0.07)" 
              stroke="rgba(255, 255, 255, 0.2)" 
              strokeWidth="1"
            />
            <path 
              d="M-10,0 L10,0" 
              stroke="rgba(167, 139, 250, 0.3)" 
              strokeWidth="2"
            />
            {/* Bubbles */}
            {[...Array(3)].map((_, i) => (
              <motion.circle
                key={i}
                cx={(i - 1) * 5}
                cy="5"
                r="1.5"
                fill="rgba(255, 255, 255, 0.3)"
                initial={{ y: 5 }}
                animate={{ y: -10 }}
                transition={{
                  duration: 2,
                  delay: i * 0.6,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />
            ))}
          </g>
        );
      case 'telescope':
        return (
          <g transform={`scale(${instrument.size}) rotate(30)`}>
            <rect 
              x="-25" 
              y="-5" 
              width="50" 
              height="10" 
              fill="rgba(79, 70, 229, 0.07)" 
              stroke="rgba(255, 255, 255, 0.2)" 
              strokeWidth="1"
            />
            <circle cx="20" cy="0" r="5" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
            <circle cx="-20" cy="0" r="5" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
          </g>
        );
      case 'compass':
        return (
          <g transform={`scale(${instrument.size})`}>
            <circle 
              cx="0" 
              cy="0" 
              r="20" 
              fill="rgba(79, 70, 229, 0.07)" 
              stroke="rgba(255, 255, 255, 0.2)" 
              strokeWidth="1"
            />
            <motion.path 
              d="M0,0 L0,-15" 
              stroke="rgba(239, 68, 68, 0.4)" 
              strokeWidth="1"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: '0px 0px' }}
            />
            <motion.path 
              d="M0,0 L12,0" 
              stroke="rgba(96, 165, 250, 0.4)" 
              strokeWidth="1"
              initial={{ rotate: 90 }}
              animate={{ rotate: 450 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: '0px 0px' }}
            />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden z-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950">
      {/* Math formulas */}
      {mathElements.map((el) => (
        <motion.div
          key={el.id}
          className="absolute font-mono text-white text-opacity-20 font-medium"
          style={{ 
            left: el.x, 
            top: el.y, 
            fontSize: el.size,
            transform: `rotate(${el.rotate}deg)`
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 0.5, 0.3],
            scale: [0, 1.1, 1]
          }}
          transition={{ 
            duration: 3,
            delay: el.id * 0.3,
            repeat: Infinity,
            repeatType: "reverse", 
            repeatDelay: 5
          }}
        >
          {el.content}
        </motion.div>
      ))}

      {/* Network visualization - AI nodes and connections */}
      <svg className="absolute inset-0 w-full h-full z-0" style={{ opacity: 0.5 }}>
        <defs>
          <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.5)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
          </radialGradient>
        </defs>
        
        {/* AI network connections */}
        {aiConnections.map((conn) => (
          <motion.line
            key={conn.id}
            x1={`${conn.source.x}%`}
            y1={`${conn.source.y}%`}
            x2={`${conn.target.x}%`}
            y2={`${conn.target.y}%`}
            stroke="rgba(99, 102, 241, 0.15)"
            strokeWidth="0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: conn.opacity }}
            transition={{ duration: Math.random() * 3 + 2 }}
          />
        ))}
        
        {/* AI network nodes */}
        {aiNodes.map((node) => (
          <motion.circle
            key={node.id}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r={node.size}
            fill="rgba(99, 102, 241, 0.15)"
            initial={{ scale: 0 }}
            animate={{ 
              scale: [0, 1, 0.8, 1],
              opacity: [0, 0.5, 0.3]
            }}
            transition={{ 
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: Math.random() * 5
            }}
          />
        ))}
      </svg>

      {/* Educational diagrams */}
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 1000 500" 
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Geometric shapes */}
        {shapes.map((shape) => (
          <motion.g
            key={shape.id}
            transform={`translate(${shape.x}, ${shape.y})`}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ 
              opacity: [0, 0.6, 0.4],
              scale: [0, 1.05, 1],
              rotate: [0, 360]
            }}
            transition={{
              duration: 4,
              delay: shape.id * 0.4,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 6
            }}
          >
            {renderShape(shape)}
          </motion.g>
        ))}

        {/* Scientific instruments */}
        {scientificInstruments.map((instrument) => (
          <motion.g
            key={instrument.id}
            transform={`translate(${instrument.x}, ${instrument.y})`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ 
              opacity: [0, 0.6, 0.4],
              y: [10, 0, 5]
            }}
            transition={{
              duration: 3,
              delay: instrument.id * 0.5,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 4
            }}
          >
            {renderScientificInstrument(instrument)}
          </motion.g>
        ))}

        {/* Atom model */}
        <motion.g transform="translate(500, 250)" style={{ opacity: 0.4 }}>
          <motion.ellipse
            rx="40"
            ry="15"
            fill="none"
            stroke="rgba(96, 165, 250, 0.2)"
            strokeWidth="0.5"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.ellipse
            rx="40"
            ry="15"
            fill="none"
            stroke="rgba(139, 92, 246, 0.2)"
            strokeWidth="0.5"
            initial={{ rotate: 60 }}
            animate={{ rotate: 420 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
          <motion.ellipse
            rx="40"
            ry="15"
            fill="none"
            stroke="rgba(236, 72, 153, 0.2)"
            strokeWidth="0.5"
            initial={{ rotate: 120 }}
            animate={{ rotate: 480 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          <motion.circle
            r="6"
            fill="rgba(255, 255, 255, 0.2)"
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </motion.g>

        {/* Periodic Table Elements with Connections (Simple Molecule) */}
        <g>
          {moleculeConnections.map(conn => (
            <motion.line
              key={conn.id}
              x1={conn.x1}
              y1={conn.y1}
              x2={conn.x2}
              y2={conn.y2}
              stroke={conn.color}
              strokeWidth="0.75"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.6, 0.4] }}
              transition={{ 
                duration: 2, 
                delay: parseInt(conn.id.split('-')[0]) * 0.3, 
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 3
              }}
            />
          ))}
          {periodicElements.map(element => (
            <motion.g
              key={element.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: element.id * 0.2 }}
            >
              <circle 
                cx={element.x} 
                cy={element.y} 
                r="10" 
                fill={element.color}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="0.5"
              />
              <text
                x={element.x}
                y={element.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255, 255, 255, 0.5)"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {element.symbol}
              </text>
            </motion.g>
          ))}
        </g>

        {/* Animated pulse rings */}
        {[
          { cx: 300, cy: 150, delay: 0 },
          { cx: 700, cy: 300, delay: 2 },
          { cx: 500, cy: 400, delay: 4 }
        ].map((pulse, i) => (
          <motion.circle
            key={i}
            cx={pulse.cx}
            cy={pulse.cy}
            r="2"
            fill="none"
            stroke="rgba(99, 102, 241, 0.2)"
            strokeWidth="1"
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 30, opacity: 0 }}
            transition={{
              duration: 4,
              delay: pulse.delay,
              repeat: Infinity,
              repeatDelay: 2
            }}
          />
        ))}

        {/* Subtle grid pattern */}
        <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path 
            d="M 20 0 L 0 0 0 20" 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.03)" 
            strokeWidth="0.5" 
          />
        </pattern>
        <rect width="100%" height="100%" fill="url(#smallGrid)" />
      </svg>

      {/* Subtle overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-blue-950/20" style={{ mixBlendMode: 'overlay' }}></div>
    </div>
  );
};

export default EducationalBackground;
