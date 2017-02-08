#include "node_binding.h"

namespace errorCheck {
  using v8::FunctionCallbackInfo;
  using v8::Exception;
  using v8::Isolate;
  using v8::String;
  using v8::Value;

  bool validateFirstNumericArgument(const FunctionCallbackInfo<Value>& args, Isolate* isolate) {
    if (!args[0]->IsNumber()) {
      isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "Incorrect argument type, expect number")
      ));
      return false;
    }
    return true;
  }

  bool validateOneNumericArgument(const FunctionCallbackInfo<Value>& args, Isolate* isolate) {
    if (args.Length() != 1) {
      isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "Requires only one numeric argument")
      ));
      return false;
    }

    return validateFirstNumericArgument(args, isolate);
  }

  bool validateArgsLength(const FunctionCallbackInfo<Value>& args, Isolate* isolate, int maxLen, int minLen) {
    int argsLen = args.Length();
    if ((argsLen > maxLen) || (argsLen < minLen)) {
      isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "Requires only one numeric argument")
      ));
      return false;
    }
    return true;
  }
}
