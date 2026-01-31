import { useEffect, useRef, useState } from 'react';
import socket from './socket';

export default function CanvasBoard() {
  const drawCanvasRef = useRef(null);
  const cursorCanvasRef = useRef(null);

  const drawCtxRef = useRef(null);
  const cursorCtxRef = useRef(null);

  const drawing = useRef(false);
  const currentStroke = useRef([]);
  const strokes = useRef([]);
  const cursors = useRef({});

  const myUser = useRef(null);
  const tool = useRef('brush');
  const brushSize = useRef(4);
  const brushColor = useRef('#000000');

  const [colorUI, setColorUI] = useState('#000000');
  const [onlineUsers, setOnlineUsers] = useState([]);

  /* -------------------- SETUP -------------------- */
  useEffect(() => {
    const drawCanvas = drawCanvasRef.current;
    const cursorCanvas = cursorCanvasRef.current;

    drawCanvas.width = cursorCanvas.width = window.innerWidth;
    drawCanvas.height = cursorCanvas.height = window.innerHeight - 80;

    drawCtxRef.current = drawCanvas.getContext('2d');
    cursorCtxRef.current = cursorCanvas.getContext('2d');

    drawCtxRef.current.lineCap = 'round';
    drawCtxRef.current.lineJoin = 'round';

    socket.on('users_update', (users) => {
      setOnlineUsers(users);
      myUser.current = users.find(u => u.id === socket.id);

      // remove stale cursors
      const validIds = new Set(users.map(u => u.id));
      Object.keys(cursors.current).forEach(id => {
        if (!validIds.has(id)) delete cursors.current[id];
      });
      redrawCursors();
    });

    socket.on('init_state', (data) => {
      strokes.current = data;
      redrawStrokes();
    });

    socket.on('draw_segment', ({ segment, style }) => {
      drawSegment(segment.from, segment.to, style);
    });

    socket.on('draw_stroke', (stroke) => {
      strokes.current.push(stroke);
    });

    socket.on('undo', () => {
      strokes.current.pop();
      redrawStrokes();
    });

    socket.on('redo', (stroke) => {
      strokes.current.push(stroke);
      redrawStrokes();
    });

    socket.on('cursor_move', ({ userId, x, y, color }) => {
      if (userId === socket.id) return;
      cursors.current[userId] = { x, y, color };
      redrawCursors();
    });

    socket.on('user_left', (userId) => {
      delete cursors.current[userId];
      redrawCursors();
    });

    return () => socket.off();
  }, []);

  /* -------------------- HELPERS -------------------- */

  const getPos = (e) => {
    const rect = drawCanvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const drawSegment = (from, to, style) => {
    const ctx = drawCtxRef.current;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);

    ctx.lineWidth = style.width;

    if (style.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = style.color;
    }

    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  };

  const redrawStrokes = () => {
    const ctx = drawCtxRef.current;
    const canvas = drawCanvasRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.current.forEach(stroke => {
      for (let i = 1; i < stroke.points.length; i++) {
        drawSegment(
          stroke.points[i - 1],
          stroke.points[i],
          stroke
        );
      }
    });
  };

  const redrawCursors = () => {
    const ctx = cursorCtxRef.current;
    const canvas = cursorCanvasRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Object.values(cursors.current).forEach(({ x, y, color }) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  /* -------------------- DRAW EVENTS -------------------- */

  const startDrawing = (e) => {
    drawing.current = true;
    currentStroke.current = [getPos(e)];
  };

  const draw = (e) => {
    const pos = getPos(e);
    socket.emit('cursor_move', pos);

    if (!drawing.current) return;

    const last = currentStroke.current.at(-1);
    currentStroke.current.push(pos);

    const style = {
      color: brushColor.current,
      width: brushSize.current,
      tool: tool.current,
    };

    drawSegment(last, pos, style);

    socket.emit('draw_segment', {
      segment: { from: last, to: pos },
      style,
    });
  };

  const stopDrawing = () => {
    if (!drawing.current) return;
    drawing.current = false;

    const stroke = {
      id: Date.now(),
      userId: socket.id,
      points: currentStroke.current,
      color: brushColor.current,
      width: brushSize.current,
      tool: tool.current,
    };

    strokes.current.push(stroke);
    socket.emit('draw_stroke', stroke);
  };

  /* -------------------- UI -------------------- */

  return (
    <>
      {/* Online Users Panel */}
      <div
        style={{
          position: 'fixed',
          top: 10,
          right: 10,
          background: '#fff',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 0 10px rgba(0,0,0,0.15)',
          fontSize: '14px',
          zIndex: 10
        }}
      >
        <strong>Online Users ({onlineUsers.length})</strong>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 6 }}>
          {onlineUsers.map(u => (
            <li key={u.id} style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: u.color,
                  display: 'inline-block',
                  marginRight: 6
                }}
              />
              {u.id === socket.id ? 'You' : u.id.slice(0, 6)}
            </li>
          ))}
        </ul>
      </div>

      {/* Toolbar */}
      <div>
        <button onClick={() => tool.current = 'brush'}>Brush</button>
        <button onClick={() => tool.current = 'eraser'}>Eraser</button>

        <input
          type="color"
          value={colorUI}
          onChange={(e) => {
            setColorUI(e.target.value);
            brushColor.current = e.target.value;
          }}
        />

        <input
          type="range"
          min="2"
          max="20"
          defaultValue="4"
          onChange={(e) => brushSize.current = e.target.value}
        />

        <button onClick={() => socket.emit('undo')}>Undo</button>
        <button onClick={() => socket.emit('redo')}>Redo</button>
      </div>

      {/* Canvases */}
      <div style={{ position: 'relative' }}>
        <canvas
          ref={drawCanvasRef}
          style={{ position: 'absolute', left: 0, top: 0 }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        <canvas
          ref={cursorCanvasRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            pointerEvents: 'none'
          }}
        />
      </div>
    </>
  );
}
