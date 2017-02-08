#include <math.h>
#include <float.h>
#include "tdist.h"
#include "normaldist.h"

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

double phi_standard(double z){
  return (half*(1.0+erf(z*halfhalf)));
}

double std_pdf(double z) {
  return exp(-half * z * z) / (sqrt(2 * PI));
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

