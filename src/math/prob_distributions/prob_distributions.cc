#include <node.h>
#include <math.h>

#include "../node_binding.h"
#include "tdist.h"
#include "normaldist.h"

namespace pd {
  using v8::FunctionCallbackInfo;
  using v8::Exception;
  using v8::Isolate;
  using v8::Object;
  using v8::Local;
  using v8::Number;
  using v8::String;
  using v8::Value;

  void Tinv(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();
    int argsLen = args.Length();
    if ((argsLen == 1) || (argsLen == 2)) {
      if (!args[0]->IsNumber()) {
        isolate->ThrowException(Exception::TypeError(
          String::NewFromUtf8(isolate, "Incorrect first argument type, expect number")
        ));
        return;
      }
      double value = args[0]->NumberValue();
      double dof = args[1]->NumberValue();
      Local<Number> num;
      if (dof > 0.0) {
        num = Number::New(isolate, inverse_t(value, dof));
      } else {
        num = Number::New(isolate, inverse_normal(value));
      }
      args.GetReturnValue().Set(num);
    } else {
      isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "Requires only one numeric argument")
      ));
      return;
    }
  }

  void Tcdf(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();
    if (!errorCheck::validateArgsLength(args, isolate, 2, 1)) {
      return;
    }
    if (!errorCheck::validateFirstNumericArgument(args, isolate)) {
      return;
    }
    double value = args[0]->NumberValue();
    double dof = args[1]->NumberValue();
    Local<Number> num;
    if (dof > 0.0) {
      num = Number::New(isolate, t_cdf(value, dof));
    } else {
      num = Number::New(isolate, phi_standard(value));
    }
    args.GetReturnValue().Set(num);
  }

  void Tpdf(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();
    if (!errorCheck::validateArgsLength(args, isolate, 2, 1)) {
      return;
    }
    if (!errorCheck::validateFirstNumericArgument(args, isolate)) {
      return;
    }
    double value = args[0]->NumberValue();
    double dof = args[1]->NumberValue();
    Local<Number> num;
    if (dof > 0.0) {
      num = Number::New(isolate, t_pdf(value, dof));
    } else {
      num = Number::New(isolate, std_pdf(value));
    }
    args.GetReturnValue().Set(num);
  }

  void Erf(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();
    if (!errorCheck::validateOneNumericArgument(args, isolate)) {
      return;
    }

    double value = args[0]->NumberValue();
    Local<Number> num = Number::New(isolate, erf(value));
    args.GetReturnValue().Set(num);
  }

  void StdNorm(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();
    if (!errorCheck::validateOneNumericArgument(args, isolate)) {
      return;
    }

    double value = args[0]->NumberValue();
    Local<Number> num = Number::New(isolate, standard_norm(value));
    args.GetReturnValue().Set(num);
  }

  void Init(Local<Object> exports) {
    NODE_SET_METHOD(exports, "stdNorm", StdNorm);
    NODE_SET_METHOD(exports, "tcdf", Tcdf);
    NODE_SET_METHOD(exports, "tinv", Tinv);
    NODE_SET_METHOD(exports, "erf", Erf);
    NODE_SET_METHOD(exports, "tpdf", Tpdf);
  }

  NODE_MODULE(prob_distributions, Init)
}
