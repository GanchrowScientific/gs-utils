#ifndef NODE_BINDING_H
#define NODE_BINDING_H

#include <node.h>

namespace errorCheck {
  bool validateFirstNumericArgument(const v8::FunctionCallbackInfo<v8::Value>& args, v8::Isolate* isolate);
  bool validateOneNumericArgument(const v8::FunctionCallbackInfo<v8::Value>& args, v8::Isolate* isolate);
  bool validateArgsLength(const v8::FunctionCallbackInfo<v8::Value>& args, v8::Isolate* isolate, int maxLen, int minLen);
}
#endif
