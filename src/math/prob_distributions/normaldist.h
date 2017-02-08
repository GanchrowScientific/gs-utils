#ifndef NORMALDIST_H
#define NORMALDIST_H

#ifndef PI
#define PI 3.14159265358979323846
#endif

#define NASNF 1+1e-10

#include <math.h>

const double halfhalf = 0.7071067811865476;

const double half = 0.5;

double phi_standard(double z);
double std_pdf(double z);
double standard_norm(double x);
double inverse_normal(double qn);

#endif

