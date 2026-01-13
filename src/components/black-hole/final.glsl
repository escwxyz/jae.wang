precision highp float;

uniform vec3 iResolution;
uniform float iTime;
uniform float iStarTime;
uniform sampler2D iChannel0;
uniform sampler2D iChannel3;
uniform float uBloomStrength;
uniform float uExposure;
uniform float uHighlightClamp;
uniform vec3 uToneMapPower;
uniform float uFinalGamma;
uniform float uSaturation;
uniform vec3 uColorGain;
uniform float uAlphaThreshold;
uniform float uAlphaSoftness;
uniform float uStarZoom;
uniform float uStarSpeed;
uniform float uStarBrightness;
uniform float uStarDarkmatter;
uniform float uStarDistfading;
uniform float uStarSaturation;
uniform float uStarFormuparam;
uniform float uStarTile;
uniform float uStarStepsize;
uniform vec2 uViewOffset;
uniform vec2 uStarCenter;
uniform float uStarHoleRadius;
uniform float uStarHoleSoftness;

vec3 saturate(vec3 x)
{
    return clamp(x, vec3(0.0), vec3(1.0));
}

vec4 cubic(float x)
{
    float x2 = x * x;
    float x3 = x2 * x;
    vec4 w;
    w.x =   -x3 + 3.0*x2 - 3.0*x + 1.0;
    w.y =  3.0*x3 - 6.0*x2       + 4.0;
    w.z = -3.0*x3 + 3.0*x2 + 3.0*x + 1.0;
    w.w =  x3;
    return w / 6.0;
}

vec4 BicubicTexture(in sampler2D tex, in vec2 coord)
{
  vec2 resolution = iResolution.xy;

  coord *= resolution;

  float fx = fract(coord.x);
  float fy = fract(coord.y);
  coord.x -= fx;
  coord.y -= fy;

  fx -= 0.5;
  fy -= 0.5;

  vec4 xcubic = cubic(fx);
  vec4 ycubic = cubic(fy);

  vec4 c = vec4(coord.x - 0.5, coord.x + 1.5, coord.y - 0.5, coord.y + 1.5);
  vec4 s = vec4(xcubic.x + xcubic.y, xcubic.z + xcubic.w, ycubic.x + ycubic.y, ycubic.z + ycubic.w);
  vec4 offset = c + vec4(xcubic.y, xcubic.w, ycubic.y, ycubic.w) / s;

  vec4 sample0 = texture(tex, vec2(offset.x, offset.z) / resolution);
  vec4 sample1 = texture(tex, vec2(offset.y, offset.z) / resolution);
  vec4 sample2 = texture(tex, vec2(offset.x, offset.w) / resolution);
  vec4 sample3 = texture(tex, vec2(offset.y, offset.w) / resolution);

  float sx = s.x / (s.x + s.y);
  float sy = s.z / (s.z + s.w);

  return mix( mix(sample3, sample2, sx), mix(sample1, sample0, sx), sy);
}

vec3 ColorFetch(vec2 coord)
{
  return texture(iChannel0, coord).rgb;
}

vec3 BloomFetch(vec2 coord)
{
  return BicubicTexture(iChannel3, coord).rgb;
}

vec3 Grab(vec2 coord, const float octave, const vec2 offset)
{
  float scale = exp2(octave);

  coord /= scale;
  coord -= offset;

  return BloomFetch(coord);
}

vec2 CalcOffset(float octave)
{
  vec2 offset = vec2(0.0);

  vec2 padding = vec2(10.0) / iResolution.xy;

  offset.x = -min(1.0, floor(octave / 3.0)) * (0.25 + padding.x);

  offset.y = -(1.0 - (1.0 / exp2(octave))) - padding.y * octave;

  offset.y += min(1.0, floor(octave / 3.0)) * 0.35;

  return offset;
}

vec3 GetBloom(vec2 coord)
{
  vec3 bloom = vec3(0.0);

  //Reconstruct bloom from multiple blurred images
  bloom += Grab(coord, 1.0, vec2(CalcOffset(0.0))) * 1.0;
  bloom += Grab(coord, 2.0, vec2(CalcOffset(1.0))) * 1.5;
  bloom += Grab(coord, 3.0, vec2(CalcOffset(2.0))) * 1.0;
  bloom += Grab(coord, 4.0, vec2(CalcOffset(3.0))) * 1.5;
  bloom += Grab(coord, 5.0, vec2(CalcOffset(4.0))) * 1.8;
  bloom += Grab(coord, 6.0, vec2(CalcOffset(5.0))) * 1.0;
  bloom += Grab(coord, 7.0, vec2(CalcOffset(6.0))) * 1.0;
  bloom += Grab(coord, 8.0, vec2(CalcOffset(7.0))) * 1.0;

  return bloom;
}

vec3 applyStarSystem(vec2 fragCoord)
{
  const int iterations = 12;
  const int volsteps = 10;

  vec2 uv = fragCoord.xy / iResolution.xy - 0.5;
  uv.y *= iResolution.y / iResolution.x;
  vec3 dir = vec3(uv * uStarZoom, 1.0);
  float time = iStarTime * uStarSpeed + 0.25;

  float a1 = 0.9250;
  float a2 = 0.915;
  mat2 rot1 = mat2(cos(a1), sin(a1), -sin(a1), cos(a1));
  mat2 rot2 = mat2(cos(a2), sin(a2), -sin(a2), cos(a2));
  dir.xz *= rot1;
  dir.xy *= rot2;
  vec3 from = vec3(1.0, 0.5, 0.5);
  from += vec3(time * 2.0, time, -2.0);
  from.xz *= rot1;
  from.xy *= rot2;

  float s = 0.1;
  float fade = 1.0;
  vec3 v = vec3(0.0);
  for (int r = 0; r < volsteps; r++)
  {
    vec3 p = from + s * dir * 0.5;
    p = abs(vec3(uStarTile) - mod(p, vec3(uStarTile * 2.0)));
    float pa = 0.0;
    float a = 0.0;
    for (int i = 0; i < iterations; i++)
    {
      p = abs(p) / dot(p, p) - uStarFormuparam;
      a += abs(length(p) - pa);
      pa = length(p);
    }
    float dm = max(0.0, uStarDarkmatter - a * a * 0.0001);
    a *= a * a;
    if (r > 6)
    {
      fade *= 1.0 - dm;
    }
    v += vec3(s, s * s, s * s * s * s) * a * uStarBrightness * fade;
    fade *= uStarDistfading;
    s += uStarStepsize;
  }

  uv = fragCoord.xy / iResolution.xy;
  vec2 center = uStarCenter;
  vec2 uvForCenter = uv - center;
  uvForCenter.x *= iResolution.x / iResolution.y;

  float d = length(uvForCenter);
  float holeMask = smoothstep(uStarHoleRadius, uStarHoleRadius + uStarHoleSoftness, d);
  v *= holeMask;

  return mix(vec3(length(v)), v, uStarSaturation) * 0.01;
}



void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  vec2 uv = fragCoord.xy / iResolution.xy;

  vec3 color = ColorFetch(uv);

  color += GetBloom(uv) * uBloomStrength;

  color *= uExposure;

  //Tonemapping and color grading
  color = pow(color, vec3(1.5));
  color = color / (uHighlightClamp + color);
  color = pow(color, vec3(1.0 / 1.5));

  color = mix(color, color * color * (3.0 - 2.0 * color), vec3(1.0));
  color = pow(color, uToneMapPower);

  color = saturate(color * 1.01);

  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = mix(vec3(luma), color, uSaturation);
  color *= uColorGain;
  color = pow(color, vec3(uFinalGamma));

  vec3 baseColor = color;
  color += applyStarSystem(fragCoord);

  float intensity = max(baseColor.r, max(baseColor.g, baseColor.b));
  float alpha = smoothstep(uAlphaThreshold, uAlphaThreshold + uAlphaSoftness, intensity);
  fragColor = vec4(color, alpha);
}

out vec4 outColor;

void main() {
  mainImage(outColor, gl_FragCoord.xy);
}
