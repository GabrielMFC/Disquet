# Username folder has a space, so CMake drops libc++_shared from the default
# link line and only -latomic -lm remain. Link the shared STL explicitly.
if(ANDROID)
  link_libraries(c++_shared)
endif()
