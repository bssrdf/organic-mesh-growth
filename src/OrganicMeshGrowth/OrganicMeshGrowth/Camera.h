
#pragma once

#include <glm/glm.hpp>
#include "Device.h"

struct CameraBufferObject {
  glm::mat4 viewMatrix;
  glm::mat4 projectionMatrix;
  glm::mat4 invViewProjMatrix;
  glm::vec3 cameraPosition;
};

class Camera {
private:
    Device* device;
    
    CameraBufferObject cameraBufferObject;
    
    VkBuffer buffer;
    VkDeviceMemory bufferMemory;

    void* mappedData;

    float fov, theta, phi;
	float aspectRatio;

public:
    Camera(Device* device, float aspectRatio);
    ~Camera();

    VkBuffer GetBuffer() const;
    
    void UpdateOrbit(float deltaX, float deltaY, float deltaZ);
};
