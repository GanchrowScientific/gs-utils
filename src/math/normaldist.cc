#include <node.h>
#include <math.h>
#include <stdio.h>
#include <float.h>
#include "prob.h"

#ifndef PI
#define PI 3.14159265358979323846
#endif

#define NASNF 1+1e-10

/* TINV COEFFICIENTS */
const double coef[4][5] = {
  1.0e0,1.0e0,0.0e0,0.0e0,0.0e0,3.0e0,16.0e0,5.0e0,0.0e0,0.0e0,-15.0e0,17.0e0,
  19.0e0,3.0e0,0.0e0,-945.0e0,-1920.0e0,1482.0e0,776.0e0,79.0e0
};

const double denom[4] = {
  4.0e0,96.0e0,384.0e0,92160.0e0
};

const int ideg[4] = { 2,3,4,5 };

const long int iter = 1e6;
const double eps = 1e-6;
/********************/

/* NORMSINV COEFFICIENTS */
const double norms_c[] = {
  1.570796288,
  0.03706987906,
 -0.8364353589e-3,
 -0.2250947176e-3,
  0.6841218299e-5,
  0.5824238515e-5,
 -0.104527497e-5,
  0.8360937017e-7,
 -0.3231081277e-8,
  0.3657763036e-10,
  0.6936233982e-12
};
/********************/

const double t_coefficients[] = { 0.3989422804014327, 0.2551219234157433 };

const double halfhalf = 0.7071067811865476;
const double half = 0.5;

double phi_standard(double z){
  return (half*(1.0+erf(z*halfhalf)));
}

// http://josiahmanson.com/prose/student_t
double t_pdf( double t, double df ) {
  return
    (t_coefficients[0] * df *
      pow((df + t*t) / df, -0.5 * df - 0.5)
    ) / (t_coefficients[1] + df);
}

double standard_norm(double x){
  return (exp(-half*x*x)*half/PI);
}

double inverse_normal(double qn){
  double w1;
  double w3;
  int i;

  if(qn < 0.0 || 1.0 < qn) return NASNF;
  if(qn == half) return 0.0;


  w1 = qn;
  if(qn > half) w1 = 1.0 - w1;

  w3 = -log(4.0 * w1 * (1.0 - w1));
  w1 = norms_c[0];

  for(i=1;i<=10;i++){
    w1 += norms_c[i] * pow(w3,i);
  }

  if(qn > half) return (sqrt(w1 * w3));

  return (-sqrt(w1 * w3));
}

double inverse_t_expanded( double qn, double df ) {
  double v = (qn-0.5)*(sqrt(df*PI)*(tgamma(df*0.5))/(tgamma((df+1)*0.5)));
  double res = 0e0, o_res = 0e0;

  int k = 0;

  while((k++)<iter) {
    res += pow(v, 2.0*k + 1.0); // missing coefficient here
    if( fabs(res - o_res) < eps ) break;
    o_res = res;
  }
  return res + v;
}


double inverse_t ( double qn, double df ){
  double q = 1-qn;

  if(qn < 0.0 || 1.0 < qn) return NASNF;
  if(qn == half) return 0.0;

  double dt1,denpow,sum,term,x,xp,xx;
  int i, j;

  x = fabs(inverse_normal(qn));
  xx = x*x;
  sum = x;
  denpow = 1.0e0;
  for ( i = 0; i < 4; i++ )
  {
      term = coef[i][0];
      for(j=1; j<ideg[i]; j++) {
        term = coef[i][j] + term * xx;
      }
      denpow *= df;
      sum += ((term*x)/(denpow*denom[i]));
  }
  if(!(qn >= 0.5e0)) goto S20;
  xp = sum;
  goto S30;
  S20:
    xp = -sum;
  S30:
    dt1 = xp;
    return dt1;
}

namespace bd {
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
        num = Number::New(isolate, t_cdf(value, dof));
      } else {
        num = Number::New(isolate, phi_standard(value));
      }
      args.GetReturnValue().Set(num);
    } else {
      isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "Requires only one numeric argument")
      ));
      return;
    }
  }

  void StdNorm(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();
    if (args.Length() != 1) {
      isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "Requires only one numeric argument")
      ));
      return;
    }

    if (!args[0]->IsNumber()) {
      isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "Incorrect argument type, expect number")
      ));
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
  }

  NODE_MODULE(normaldist, Init)
}
