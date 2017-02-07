#include <node.h>
#include <math.h>
#include <stdio.h>
#include <float.h>

#ifndef PI
#define PI 3.14159265358979323846
#endif

#define NASNF 1+1e-10

const int beta_inc_it_max = 1000;
const double beta_inc_tol = 1.0E-07;

double beta(double a, double b) {
  return (tgamma(a)*tgamma(b)) / tgamma(a+b);
}

double r8_abs( double x ) {
  double value;

  if ( 0.0 <= x )
  {
    value = x;
  }
  else
  {
    value = -x;
  }
  return value;
}

double beta_inc ( double a, double b, double x )

/******************************************************************************/
/*
  Purpose:

    BETA_INC returns the value of the incomplete Beta function.

  Discussion:

    This calculation requires an iteration.  In some cases, the iteration
    may not converge rapidly, or may become inaccurate.

    BETA_INC(A,B,X)

      =   Integral ( 0 <= T <= X ) T^(A-1) (1-T)^(B-1) dT
        / Integral ( 0 <= T <= 1 ) T^(A-1) (1-T)^(B-1) dT

      =   Integral ( 0 <= T <= X ) T^(A-1) (1-T)^(B-1) dT
        / BETA(A,B)

  Licensing:

    This code is distributed under the GNU LGPL license.

  Modified:

    10 October 2004

  Author:

    Original FORTRAN77 version by Majumder, Bhattacharjee.
    C version by John Burkardt.

  Reference:

    Majumder, Bhattacharjee,
    Algorithm AS63,
    Applied Statistics,
    1973, volume 22, number 3.

  Parameters:

    Input, double A, B, the parameters of the function.
    0.0 < A,
    0.0 < B.

    Input, double X, the argument of the function.
    Normally, 0.0 <= X <= 1.0.

    Output, double BETA_INC, the value of the function.
*/
{
  double cx;
  int i;
  int it;
  int indx;
  int ns;
  double pp;
  double psq;
  double qq;
  double rx;
  double temp;
  double term;
  double value;
  double xx;

  /*if ( a <= 0.0 )
  {
    fprintf ( stderr, "\n" );
    fprintf ( stderr, "BETA_INC - Fatal error!\n" );
    fprintf ( stderr, "  A <= 0.\n" );
    exit ( 1 );
  }

  if ( b <= 0.0 )
  {
    fprintf ( stderr, "\n" );
    fprintf ( stderr, "BETA_INC - Fatal error!\n" );
    fprintf ( stderr, "  B <= 0.\n" );
    exit ( 1 );
  }*/

  if ( x <= 0.0 )
  {
    value = 0.0;
    return value;
  }
  else if ( 1.0 <= x )
  {
    value = 1.0;
    return value;
  }
/*
  Change tail if necessary and determine S.
*/
  psq = a + b;

  if ( a < ( a + b ) * x )
  {
    xx = 1.0 - x;
    cx = x;
    pp = b;
    qq = a;
    indx = 1;
  }
  else
  {
    xx = x;
    cx = 1.0 - x;
    pp = a;
    qq = b;
    indx = 0;
  }

  term = 1.0;
  i = 1;
  value = 1.0;

  ns = ( int ) ( qq + cx * ( a + b ) );
/*
  Use Soper's reduction formulas.
*/
  rx = xx / cx;

  temp = qq - ( double ) i;
  if ( ns == 0 )
  {
    rx = xx;
  }

  it = 0;

  for ( ; ; )
  {
    it = it + 1;

    /*if ( beta_inc_it_max < it )
    {
      fprintf ( stderr, "\n" );
      fprintf ( stderr, "BETA_INC - Fatal error!\n" );
      fprintf ( stderr, "  Maximum number of iterations exceeded!\n" );
      fprintf ( stderr, "  IT_MAX = %d\n", beta_inc_it_max );
      exit ( 1 );
    }*/

    term = term * temp * rx / ( pp + ( double ) ( i ) );
    value = value + term;
    temp = r8_abs ( term );

    if ( temp <= beta_inc_tol && temp <= beta_inc_tol * value )
    {
      break;
    }

    i = i + 1;
    ns = ns - 1;

    if ( 0 <= ns )
    {
      temp = qq - ( double ) i;
      if ( ns == 0 )
      {
        rx = xx;
      }
    }
    else
    {
      temp = psq;
      psq = psq + 1.0;
    }
  }
/*
  Finish calculation.
*/
  value = value * exp ( pp * log ( xx )
    + ( qq - 1.0 ) * log ( cx ) ) / ( beta ( a, b ) * pp );

  if ( indx )
  {
    value = 1.0 - value;
  }

  return value;
}

double student_cdf ( double t, double df, double a, double b )

/******************************************************************************/
/*
  Purpose:

    STUDENT_CDF evaluates the central Student T CDF.

  Licensing:

    This code is distributed under the GNU LGPL license.

  Modified:

    02 November 2005

  Author:

    John Burkardt

  Parameters:

    Input, double X, the argument of the CDF.

    Input, double A, B, shape parameters of the PDF,
    used to transform the argument X to a shifted and scaled
    value Y = ( X - A ) / B.  It is required that B be nonzero.
    For the standard distribution, A = 0 and B = 1.

    Input, double C, is usually called the number of
    degrees of freedom of the distribution.  C is typically an
    integer, but that is not essential.  It is required that
    C be strictly positive.

    Output, double STUDENT_CDF, the value of the CDF.
*/
{
  double a2;
  double b2;
  double c2;
  double cdf;
  double y;

  y = ( t - a ) / b;

  a2 = 0.5 * df;
  b2 = 0.5;
  c2 = df / ( df + y * y );

  if ( y <= 0.0 )
  {
    cdf = 0.5 * beta_inc ( a2, b2, c2 );
  }
  else
  {
    cdf = 1.0 - 0.5 * beta_inc ( a2, b2, c2 );
  }

  return cdf;
}

double t_cdf( double t, double df ) {
  return student_cdf( t, df, 0.0, 1.0 );
}


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

double std_pdf(double z) {
  return exp(-half * z * z) / (sqrt(2 * PI));
}

double t_pdf( double t, double df ) {
  return pow(1 + t*t / df, -(df+1)/2) / (sqrt(df) * beta(0.5, df/2.0));
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

  void Tpdf(const FunctionCallbackInfo<Value>& args) {
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
        num = Number::New(isolate, t_pdf(value, dof));
      } else {
        num = Number::New(isolate, std_pdf(value));
      }
      args.GetReturnValue().Set(num);
    } else {
      isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "Requires only one numeric argument")
      ));
      return;
    }
  }

  void Erf(const FunctionCallbackInfo<Value>& args) {
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
    Local<Number> num = Number::New(isolate, erf(value));
    args.GetReturnValue().Set(num);
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
    NODE_SET_METHOD(exports, "erf", Erf);
    NODE_SET_METHOD(exports, "tpdf", Tpdf);
  }

  NODE_MODULE(normaldist, Init)
}
