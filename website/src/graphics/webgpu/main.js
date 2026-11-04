// raw webgpu line renderer: same job as src/webgl, one device, one canvas, one mvp per shape.
// vertex layout: x, y, z, r, g, b (interleaved, 24 bytes). only binding: the 4x4 mvp.

const SHADER = `
struct Uniforms { mvp: mat4x4<f32> };
@group(0) @binding(0) var<uniform> u : Uniforms;

struct VertexOut {
  @builtin(position) clip: vec4f,
  @location(0) color: vec3f,
};

@vertex
fn vs(@location(0) pos: vec3f, @location(1) color: vec3f) -> VertexOut {
  var out: VertexOut;
  out.clip = u.mvp * vec4f(pos, 1.0);
  out.color = color;
  return out;
}

@fragment
fn fs(input: VertexOut) -> @location(0) vec4f {
  return vec4f(input.color, 1.0);
}
`;

const STRIDE = 24;
const FLOATS = 6;
const MVP_BYTES = 64;

export async function create(canvas) {
  if (!navigator.gpu) throw new Error('webgpu unavailable');
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error('no webgpu adapter');
  const device = await adapter.requestDevice();
  const context = canvas.getContext('webgpu');
  if (!context) throw new Error('webgpu context unavailable');

  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: 'premultiplied' });

  const module = device.createShaderModule({ code: SHADER });
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module,
      entryPoint: 'vs',
      buffers: [{
        arrayStride: STRIDE,
        attributes: [
          { shaderLocation: 0, offset: 0, format: 'float32x3' },
          { shaderLocation: 1, offset: 12, format: 'float32x3' },
        ],
      }],
    },
    fragment: { module, entryPoint: 'fs', targets: [{ format }] },
    primitive: { topology: 'line-list' },
    // shortcut: no msaa, the canvas backbuffer is single-sample and chromium drops the pass
    // if the pipeline asks for more. add an offscreen 4x texture + resolveTarget to smooth lines.
  });

  let pass = null;
  let encoder = null;
  let width = 0;
  let height = 0;

  const clamp = (v, max) => Math.max(0, Math.min(v, max));

  return {
    mesh(data) {
      const vertexBuffer = device.createBuffer({
        size: data.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(vertexBuffer, 0, data);
      const uniformBuffer = device.createBuffer({
        size: MVP_BYTES,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
      });
      return { vertexBuffer, uniformBuffer, bindGroup, count: data.length / FLOATS };
    },

    free(shape) {
      shape.vertexBuffer.destroy();
      shape.uniformBuffer.destroy();
    },

    begin(w, h) {
      width = w;
      height = h;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      encoder = device.createCommandEncoder();
      pass = encoder.beginRenderPass({
        colorAttachments: [{
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: 'clear',
          storeOp: 'store',
        }],
      });
    },

    draw(shape, mvp, [x, y, w, h], dpr, clip) {
      device.queue.writeBuffer(shape.uniformBuffer, 0, mvp);
      pass.setViewport(x * dpr, y * dpr, w * dpr, h * dpr, 0, 1);
      const r = clip ?? [0, 0, width / dpr, height / dpr];
      const left = clamp(r[0] * dpr, width);
      const top = clamp(r[1] * dpr, height);
      pass.setScissorRect(left, top, clamp(r[2] * dpr, width - left), clamp(r[3] * dpr, height - top));
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, shape.bindGroup);
      pass.setVertexBuffer(0, shape.vertexBuffer);
      pass.draw(shape.count);
    },

    end() {
      pass.end();
      device.queue.submit([encoder.finish()]);
    },

    destroy() {
      device.destroy();
    },
  };
}
