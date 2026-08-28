'use client';

import React, { useEffect, useRef } from 'react';

const FS_MAIN_SHADER = `\nvoid main(void){\n    vec4 color = vec4(0.0,0.0,0.0,1.0);\n    mainImage( color, gl_FragCoord.xy );\n    gl_FragColor = color;\n}`;
const BASIC_FS = `void mainImage( out vec4 fragColor, in vec2 fragCoord ) {\n    vec2 uv = fragCoord/iResolution.xy;\n    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));\n    fragColor = vec4(col,1.0);\n}`;
const BASIC_VS = `attribute vec3 aVertexPosition;\nvoid main(void) {\n    gl_Position = vec4(aVertexPosition, 1.0);\n}`;
const UNIFORM_TIME = 'iTime';
const UNIFORM_RESOLUTION = 'iResolution';

function isVectorType(t, v) {
  return !t.includes('v') && Array.isArray(v) && v.length > Number.parseInt(t.charAt(0));
}

const processUniform = (gl, location, t, value) => {
  if (isVectorType(t, value)) {
    switch (t) {
      case '2f':
        return gl.uniform2f(location, value[0], value[1]);
      case '3f':
        return gl.uniform3f(location, value[0], value[1], value[2]);
      case '4f':
        return gl.uniform4f(location, value[0], value[1], value[2], value[3]);
      case '2i':
        return gl.uniform2i(location, value[0], value[1]);
      case '3i':
        return gl.uniform3i(location, value[0], value[1], value[2]);
      case '4i':
        return gl.uniform4i(location, value[0], value[1], value[2], value[3]);
    }
  }
  if (typeof value === 'number') {
    switch (t) {
      case '1i':
        return gl.uniform1i(location, value);
      default:
        return gl.uniform1f(location, value);
    }
  }
  switch (t) {
    case '1iv':
      return gl.uniform1iv(location, value);
    case '2iv':
      return gl.uniform2iv(location, value);
    case '3iv':
      return gl.uniform3iv(location, value);
    case '4iv':
      return gl.uniform4iv(location, value);
    case '1fv':
      return gl.uniform1fv(location, value);
    case '2fv':
      return gl.uniform2fv(location, value);
    case '3fv':
      return gl.uniform3fv(location, value);
    case '4fv':
      return gl.uniform4fv(location, value);
  }
};

const uniformTypeToGLSLType = (t) => {
  switch (t) {
    case '1f': return 'float';
    case '2f': return 'vec2';
    case '3f': return 'vec3';
    case '4f': return 'vec4';
    case '1i': return 'int';
    case '2i': return 'ivec2';
    case '3i': return 'ivec3';
    case '4i': return 'ivec4';
    case '1iv': return 'int';
    case '2iv': return 'ivec2';
    case '3iv': return 'ivec3';
    case '4iv': return 'ivec4';
    case '1fv': return 'float';
    case '2fv': return 'vec2';
    case '3fv': return 'vec3';
    case '4fv': return 'vec4';
    default: return 'float';
  }
};

const insertStringAtIndex = (currentString, string, index) =>
  index > 0
    ? currentString.substring(0, index) +
      string +
      currentString.substring(index, currentString.length)
    : string + currentString;

export function ReactShaderToy({
  fs,
  vs = BASIC_VS,
  uniforms: propUniforms,
  clearColor = [0, 0, 0, 0],
  precision = 'highp',
  style,
  contextAttributes = { alpha: true, antialias: true },
  devicePixelRatio = 1,
  onError = console.error,
  onWarning = console.warn,
  ...canvasProps
}) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const squareVerticesBufferRef = useRef(null);
  const shaderProgramRef = useRef(null);
  const vertexPositionAttributeRef = useRef(undefined);
  const animFrameIdRef = useRef(undefined);
  const initFrameIdRef = useRef(undefined);
  const timerRef = useRef(0);
  const lastTimeRef = useRef(0);
  const resizeObserverRef = useRef(undefined);
  
  const uniformsRef = useRef({
    [UNIFORM_TIME]: { type: 'float', isNeeded: false, value: 0 },
    [UNIFORM_RESOLUTION]: { type: 'vec2', isNeeded: false, value: [0, 0] },
  });
  const propsUniformsRef = useRef(propUniforms);

  useEffect(() => {
    propsUniformsRef.current = propUniforms;
  }, [propUniforms]);

  const initWebGL = () => {
    if (!canvasRef.current) return;
    glRef.current =
      canvasRef.current.getContext('webgl', contextAttributes) ||
      canvasRef.current.getContext('experimental-webgl', contextAttributes);
    glRef.current?.getExtension('OES_standard_derivatives');
  };

  const initBuffers = () => {
    const gl = glRef.current;
    if (!gl) return;
    squareVerticesBufferRef.current = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBufferRef.current);
    const vertices = [1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  };

  const onResize = () => {
    const gl = glRef.current;
    if (!gl || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dpr = devicePixelRatio || (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1;
    const displayWidth = Math.floor((rect.width || 200) * dpr);
    const displayHeight = Math.floor((rect.height || 200) * dpr);
    gl.canvas.width = displayWidth;
    gl.canvas.height = displayHeight;
    if (uniformsRef.current.iResolution?.isNeeded && shaderProgramRef.current) {
      const rUniform = gl.getUniformLocation(shaderProgramRef.current, UNIFORM_RESOLUTION);
      if (rUniform) gl.uniform2fv(rUniform, [gl.canvas.width, gl.canvas.height]);
    }
  };

  const createShader = (type, shaderCodeAsText) => {
    const gl = glRef.current;
    if (!gl) return null;
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, shaderCodeAsText);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      onWarning?.(`Error compiling shader:\n${shaderCodeAsText}`);
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      onError?.(`Shader compiler log: ${log}`);
      return null;
    }
    return shader;
  };

  const initShaders = (fragmentShader, vertexShader) => {
    const gl = glRef.current;
    if (!gl) return;
    const fragmentShaderObj = createShader(gl.FRAGMENT_SHADER, fragmentShader);
    const vertexShaderObj = createShader(gl.VERTEX_SHADER, vertexShader);
    shaderProgramRef.current = gl.createProgram();
    if (!shaderProgramRef.current || !vertexShaderObj || !fragmentShaderObj) return;
    gl.attachShader(shaderProgramRef.current, vertexShaderObj);
    gl.attachShader(shaderProgramRef.current, fragmentShaderObj);
    gl.linkProgram(shaderProgramRef.current);
    if (!gl.getProgramParameter(shaderProgramRef.current, gl.LINK_STATUS)) {
      onError?.(`Unable to link shader program: ${gl.getProgramInfoLog(shaderProgramRef.current)}`);
      return;
    }
    gl.useProgram(shaderProgramRef.current);
    vertexPositionAttributeRef.current = gl.getAttribLocation(shaderProgramRef.current, 'aVertexPosition');
    if (vertexPositionAttributeRef.current !== -1) {
      gl.enableVertexAttribArray(vertexPositionAttributeRef.current);
    }
  };

  const processCustomUniforms = () => {
    if (propUniforms) {
      for (const name of Object.keys(propUniforms)) {
        const uniform = propUniforms[name];
        if (!uniform) continue;
        const { value, type } = uniform;
        const glslType = uniformTypeToGLSLType(type);
        uniformsRef.current[name] = { type: glslType, isNeeded: false, value };
      }
    }
  };

  const preProcessFragment = (fragment) => {
    const precisionString = `precision highp float;\n`;
    let fragmentShader = precisionString
      .concat(`#define DPR ${(devicePixelRatio || 1).toFixed(1)}\n`)
      .concat(fragment.replace(/texture\(/g, 'texture2D('));
    for (const uniform of Object.keys(uniformsRef.current)) {
      if (fragment.includes(uniform)) {
        const u = uniformsRef.current[uniform];
        if (!u) continue;
        fragmentShader = insertStringAtIndex(
          fragmentShader,
          `uniform ${u.type} ${uniform}; \n`,
          fragmentShader.lastIndexOf(precisionString) + precisionString.length,
        );
        u.isNeeded = true;
      }
    }
    if (fragment.includes('mainImage')) {
      fragmentShader = fragmentShader.concat(FS_MAIN_SHADER);
    }
    return fragmentShader;
  };

  const setUniforms = (timestamp) => {
    const gl = glRef.current;
    if (!gl || !shaderProgramRef.current) return;
    const delta = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0;
    lastTimeRef.current = timestamp;
    const propUniforms = propsUniformsRef.current;
    if (propUniforms) {
      for (const name of Object.keys(propUniforms)) {
        const currentUniform = propUniforms[name];
        if (!currentUniform) continue;
        if (uniformsRef.current[name]?.isNeeded) {
          const customUniformLocation = gl.getUniformLocation(shaderProgramRef.current, name);
          if (!customUniformLocation) continue;
          processUniform(gl, customUniformLocation, currentUniform.type, currentUniform.value);
        }
      }
    }
    if (uniformsRef.current.iResolution?.isNeeded) {
      const rUniform = gl.getUniformLocation(shaderProgramRef.current, UNIFORM_RESOLUTION);
      if (rUniform) gl.uniform2fv(rUniform, [gl.canvas.width, gl.canvas.height]);
    }
    if (uniformsRef.current.iTime?.isNeeded) {
      const timeUniform = gl.getUniformLocation(shaderProgramRef.current, UNIFORM_TIME);
      if (timeUniform) gl.uniform1f(timeUniform, (timerRef.current += delta));
    }
  };

  const drawScene = (timestamp) => {
    const gl = glRef.current;
    if (!gl) return;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBufferRef.current);
    if (vertexPositionAttributeRef.current !== undefined && vertexPositionAttributeRef.current !== -1) {
      gl.vertexAttribPointer(vertexPositionAttributeRef.current, 3, gl.FLOAT, false, 0, 0);
    }
    setUniforms(timestamp);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    animFrameIdRef.current = requestAnimationFrame(drawScene);
  };

  useEffect(() => {
    function init() {
      initWebGL();
      const gl = glRef.current;
      if (gl && canvasRef.current) {
        gl.clearColor(0, 0, 0, 0);
        gl.viewport(0, 0, canvasRef.current.width, canvasRef.current.height);
        processCustomUniforms();
        initShaders(preProcessFragment(fs || BASIC_FS), vs || BASIC_VS);
        initBuffers();
        onResize();
        animFrameIdRef.current = requestAnimationFrame(drawScene);
        if (typeof ResizeObserver !== 'undefined' && canvasRef.current) {
          resizeObserverRef.current = new ResizeObserver(onResize);
          resizeObserverRef.current.observe(canvasRef.current);
        }
      }
    }

    initFrameIdRef.current = requestAnimationFrame(init);

    return () => {
      cancelAnimationFrame(initFrameIdRef.current);
      cancelAnimationFrame(animFrameIdRef.current);
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      const gl = glRef.current;
      if (gl) {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    };
  }, [fs, vs]);

  return (
    <canvas ref={canvasRef} style={{ height: '100%', width: '100%', display: 'block', ...style }} {...canvasProps} />
  );
}
