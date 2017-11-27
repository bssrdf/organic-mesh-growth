#pragma once

#include <glm/glm.hpp>
#include <chrono>

#include "Model.h"
#include "Texture3D.h"

using namespace std::chrono;

struct Time {
    float deltaTime = 0.0f;
    float totalTime = 0.0f;
};

class Scene {
private:
    Device* device;
    
    VkBuffer timeBuffer;
    VkDeviceMemory timeBufferMemory;
    Time time;
	std::vector<Texture3D*> sceneSDF;
    
    void* mappedData;

    std::vector<Model*> models;

high_resolution_clock::time_point startTime = high_resolution_clock::now();

public:
    Scene() = delete;
    Scene(Device* device);
    ~Scene();

    const std::vector<Model*>& GetModels() const;
    
    void AddModel(Model* model);

    VkBuffer GetTimeBuffer() const;

	Texture3D* GetSceneSDF(int index);
	void CreateSceneSDF();

    void UpdateTime();
};