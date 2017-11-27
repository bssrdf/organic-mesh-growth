#version 450
#extension GL_ARB_separate_shader_objects : enable

#define MAX_DISTANCE 1.7320508
#define EPSILON 0.001

layout(set = 0, binding = 0) uniform CameraBufferObject {
    mat4 view;
	mat4 proj;
	mat4 invViewProj;
	vec3 position;
} camera;

layout(set = 1, binding = 1) uniform sampler2D texSampler;
layout(set = 1, binding = 2) uniform sampler3D sdfSampler;

layout(location = 0) in vec3 rayOrigin;

layout(location = 0) out vec4 outColor;

float vmax(vec3 v) {
	return max(max(v.x, v.y), v.z);
}

float vmin(vec3 v) {
	return min(min(v.x, v.y), v.z);
}

float fBox(vec3 p, vec3 b) {
	vec3 d = abs(p) - b;
	return length(max(d, vec3(0))) + vmax(min(d, vec3(0)));
}

float sdf(vec3 pos)
{
	pos += .5;
	float dist = texture(sdfSampler, pos).x;
	return dist;
}

vec3 sdfNormal(vec3 pos, float epsilon)
{
	vec2 eps = vec2(epsilon, 0.0);

	float dx = sdf(pos + eps.xyy) - sdf(pos - eps.xyy);
	float dy = sdf(pos + eps.yxy) - sdf(pos - eps.yxy);
	float dz = sdf(pos + eps.yyx) - sdf(pos - eps.yyx);

	return normalize(vec3(dx, dy, dz));
}

const vec3 CLEAR_COLOR = vec3(.1, .09, .1);

vec3 sdf_viz(vec3 rO, vec3 rD)
{
	rO.y += .5;
    float t = -rO.y / rD.y;
        
    if(t < 0.0)
        return CLEAR_COLOR;
    
    vec3 p = rO + rD * t;    

	if(abs(p.x) > .5 || abs(p.z) > .5)
		return CLEAR_COLOR;

	p.y -= .5;
    float d = sdf(p) * 3.0;
    return mix(CLEAR_COLOR, CLEAR_COLOR * 2.0, (smoothstep(.1, .2, mod(d, 1.0)) * .5));
}

void main() 
{
	vec3 rayDirection = normalize(rayOrigin - camera.position);
	float t = 0.0;
	bool hit = false;

	//outColor = vec4(sdf_viz(rayOrigin, rayDirection), 1.0);

	for(int i = 0; i < 150; ++i)
	{
		vec3 pos = rayOrigin + rayDirection * t;
		float dist = min(0.05, sdf(pos) * .05);

		t += dist;

		if(dist < EPSILON)
		{
			hit = true;
			break;
		}

		// A bit expensive but eh
		if(vmax(abs(pos)) > .5 + EPSILON)
			break;
	}

	if(hit)
	{
		vec3 pos = rayOrigin + rayDirection * t;
		vec3 normal = sdfNormal(pos, EPSILON);

		vec3 ssNormal = (camera.view * vec4(normal, 0.0)).xyz * vec3(1.0, -1.0, 1.0) * .5 + .5;
		//outColor = vec4(dot(normal, vec3(.577))) * .75 + .25;
		outColor = texture(texSampler, ssNormal.xy);
	}
	else
	{
	    outColor = vec4(sdf_viz(rayOrigin, rayDirection), 1.0);
	}
}
