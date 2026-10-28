// raw webgl2 line renderer. one context draws every shape, each into its own viewport.
// vertex layout: x, y, z, r, g, b (interleaved, 24 bytes). only uniform: the 4x4 mvp.

const VS = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aColor;
uniform mat4 uMvp;
out vec3 vColor;
void main() {
  gl_Position = uMvp * vec4(aPos, 1.0);
  vColor = aColor;
}`;

const FS = `#version 300 es
precision mediump float;
in vec3 vColor;
out vec4 outColor;
void main() {
  outColor = vec4(vColor, 1.0);
}`;

const STRIDE = 24;
const FLOATS = 6;

export async function create(canvas) {
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: true });
  if (!gl) throw new Error('webgl2 unavailable');

  const program = gl.createProgram();
  for (const [type, source] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, FS]]) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const uMvp = gl.getUniformLocation(program, 'uMvp');

  gl.clearColor(0, 0, 0, 0);

  let stageH = 0;

  return {
    mesh(data) {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      gl.enableVertexAttribArray(0);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, STRIDE, 0);
      gl.vertexAttribPointer(1, 3, gl.FLOAT, false, STRIDE, 12);
      gl.bindVertexArray(null);
      return { vao, buffer, count: data.length / FLOATS };
    },

    free(shape) {
      gl.deleteVertexArray(shape.vao);
      gl.deleteBuffer(shape.buffer);
    },

    begin(width, height) {
      stageH = height;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.disable(gl.SCISSOR_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT);
    },

    // rect and clip are css px from the viewport top-left; gl viewports start bottom-left
    draw(shape, mvp, rect, dpr, clip) {
      gl.bindVertexArray(shape.vao);
      gl.uniformMatrix4fv(uMvp, false, mvp);
      gl.viewport(rect[0] * dpr, stageH - (rect[1] + rect[3]) * dpr, rect[2] * dpr, rect[3] * dpr);
      if (clip) {
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(clip[0] * dpr, stageH - (clip[1] + clip[3]) * dpr, clip[2] * dpr, clip[3] * dpr);
      } else {
        gl.disable(gl.SCISSOR_TEST);
      }
      gl.drawArrays(gl.LINES, 0, shape.count);
    },

    end() {},

    destroy() {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
