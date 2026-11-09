"use client";

import { useEffect, useRef } from "react";
import { useReduceMotion } from "@/lib/useReduceMotion";

/**
 * Atmosphärische Lichtschicht (WebGL, ein Fragment-Shader, keine Bibliothek).
 * Wird per `mix-blend-mode: screen` über das Hero-Bild gelegt: Schwarz = keine Wirkung.
 *
 * Modi: home (Lichtreflexe, Dunst, Partikel) · heat (aufsteigende Wärme) · water (Kaustik)
 *       · climate (Luftströmung) · vent (Luftzirkulation)
 *
 * Performance: rendert in reduzierter Auflösung, pausiert außerhalb des Sichtbereichs und
 * bei verstecktem Tab; ohne WebGL wird einfach nichts gezeichnet (das Foto bleibt).
 * Reduzierte Bewegung: ein einziges, ruhendes Bild.
 */
export type LightMode = "home" | "heat" | "water" | "climate";
const MODE_ID: Record<LightMode, number> = { home: 0, heat: 1, water: 2, climate: 3 };

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;
uniform float uMode;
uniform float uIntensity;

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i+vec2(1.,0.)), c = hash(i+vec2(0.,1.)), d = hash(i+vec2(1.,1.));
  vec2 u = f*f*(3.-2.*f);
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
float fbm(vec2 p){ float v = 0., a = .5; for(int i=0;i<5;i++){ v += a*noise(p); p *= 2.02; a *= .5; } return v; }

// schwebende Lichtpartikel: je Zelle ein Punkt, langsam aufsteigend, leicht funkelnd
float particles(vec2 uv, float t, float scale, float speed){
  vec2 g = uv*scale; g.y -= t*speed;
  vec2 id = floor(g); vec2 f = fract(g)-.5;
  float h = hash(id);
  vec2 o = vec2(hash(id+3.1), hash(id+7.7))-.5;
  float d = length(f - o*.7);
  float tw = .55 + .45*sin(t*1.3 + h*40.);
  return smoothstep(.06, .0, d) * step(.72, h) * tw;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv; p.x *= uRes.x/uRes.y;
  float t = uTime;
  vec3 col = vec3(0.);
  vec2 ptr = uPointer; ptr.x *= uRes.x/uRes.y;
  float glow = exp(-3.5*length(p-ptr));

  if (uMode < .5) {
    // HOME: diagonale Lichtreflexe wie Spiegelungen auf Glas, Tiefendunst, Partikel
    // mehrere feine Glanzlinien statt eines breiten Lichtkegels
    float band = sin((p.x*1.2 + p.y*.55)*7.5 - t*.16);
    float streak = pow(max(band, 0.), 60.) * smoothstep(.35, .9, fbm(p*1.7 + vec2(t*.04, 0.)));
    float haze = fbm(p*1.6 + vec2(t*.02, -t*.015)) * smoothstep(1.1, .0, uv.y);
    col += vec3(.62,.80,1.) * streak * .22;
    col += vec3(.20,.36,.62) * haze * .35;
    col += vec3(1.,.72,.42) * glow * .18;
    col += vec3(.85,.93,1.) * particles(p, t, 26., .025) * .7;
  } else if (uMode < 1.5) {
    // WÄRME: aufsteigende, verwirbelte Wärmeschlieren
    vec2 q = vec2(p.x*1.4, p.y*1.1 - t*.08);
    float w = fbm(q + fbm(q*1.3 + t*.03)*1.4);
    float rise = smoothstep(.9, .0, uv.y);
    float ribbon = pow(smoothstep(.3, .9, w), 2.);
    col += mix(vec3(.94,.42,.10), vec3(1.,.74,.40), w) * ribbon * rise * 1.05;
    col += vec3(1.,.55,.2) * glow * .22;
    col += vec3(1.,.8,.55) * particles(p, t, 22., .05) * .6;
  } else if (uMode < 2.5) {
    // WASSER: Lichtkaustik wie am Boden eines Beckens
    vec2 q = p*5.;
    float c = 0.;
    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      q += vec2(sin(q.y*.9 + t*.35 + fi), cos(q.x*.8 - t*.3 + fi*1.7)) * .45;
      c += .045 / abs(sin(q.x*.5) * cos(q.y*.5) + .02);
    }
    float caustic = pow(clamp(c*.07, 0., 1.), 3.);
    col += vec3(.55,.82,1.) * caustic * smoothstep(1.1, .1, uv.y) * .32;
    col += vec3(.75,.9,1.) * particles(p, t, 24., .03) * .45;
    col += vec3(.6,.85,1.) * glow * .2;
  } else if (uMode < 3.5) {
    // KLIMA: feine Stromlinien, die ruhig horizontal ziehen
    float psi = p.y + .28*fbm(vec2(p.x*1.1 - t*.06, p.y*1.4));
    float lines = smoothstep(0., .02, abs(fract(psi*16.) - .5) - .47);
    float dash = smoothstep(.3, .95, fract(p.x*1.6 - t*.12 + psi*4.));
    col += vec3(.72,.90,1.) * lines * dash * .2;
    col += vec3(.8,.93,1.) * particles(p, t, 30., -.0) * .5;
    col += vec3(.7,.9,1.) * glow * .2;
  } else {
    // LÜFTUNG: Zirkulation um ein Zentrum (Zuluft/Abluft als Kreislauf)
    vec2 c = vec2(.95*uRes.x/uRes.y, .45);
    vec2 d = p - c;
    float r = length(d);
    float a = atan(d.y, d.x);
    float ring = r + .06*fbm(vec2(a*1.5, r*3.) + t*.04);
    float lines = smoothstep(0., .02, abs(fract(ring*16.) - .5) - .47);
    float flow = smoothstep(.3, .95, fract(a/6.2831*3. - t*.07 + ring*2.));
    col += vec3(.36,.82,.84) * lines * flow * smoothstep(1.4, .2, r) * .26;
    col += vec3(.5,.9,.9) * glow * .2;
    col += vec3(.8,1.,1.) * particles(p, t, 26., .01) * .45;
  }

  // weiche Vignette, damit die Ränder ruhig bleiben
  col *= smoothstep(1.25, .35, length(uv - .5) * 1.6);
  gl_FragColor = vec4(col * uIntensity, 1.);
}
`;

export function LightField({
  mode = "home",
  intensity = 1,
  className = "",
}: {
  mode?: LightMode;
  intensity?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReduceMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uPointer = gl.getUniformLocation(prog, "uPointer");
    gl.uniform1f(gl.getUniformLocation(prog, "uMode"), MODE_ID[mode]);
    gl.uniform1f(gl.getUniformLocation(prog, "uIntensity"), intensity);

    // reduzierte Auflösung: weiche Effekte brauchen keine volle Pixeldichte
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const scale = coarse ? 0.4 : 0.55;
    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * scale));
      const h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, w, h);
    };
    resize();
    let raf = 0;
    const ro = new ResizeObserver(() => {
      resize();
      if (!raf) draw(performance.now());
    });
    ro.observe(canvas);

    // Zeiger: weiches Nachziehen (gedämpft), damit das Licht nicht hektisch springt
    const target = { x: 0.7, y: 0.6 };
    const ptr = { x: 0.7, y: 0.6 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1 - (e.clientY - r.top) / r.height;
    };
    if (!coarse) window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const start = performance.now() - 6000;
    const draw = (now: number) => {
      ptr.x += (target.x - ptr.x) * 0.04;
      ptr.y += (target.y - ptr.y) * 0.04;
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uPointer, ptr.x, ptr.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      draw(now);
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
      else raf = 0;
    };

    if (reduce) {
      draw(performance.now());
    } else {
      raf = requestAnimationFrame(loop);
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf && !reduce) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    const onVis = () => {
      if (!document.hidden && visible && !raf && !reduce) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [mode, intensity, reduce]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full mix-blend-screen ${className}`}
    />
  );
}
