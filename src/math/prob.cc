#include <math.h>
#include "prob.h"


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

double t_cdf( double t, double df ) {
  return student_cdf( t, df, 0.0, 1.0 );
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

