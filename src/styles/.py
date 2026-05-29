import numpy as np
import matplotlib.pyplot as plt

metros_cuadrados = np.array([50, 75, 100, 125, 150, 180])
precio_venta = np.array([125.5, 180.2, 225.8, 290.1, 345.5, 410.0])

m, b = np.polyfit(metros_cuadrados, precio_venta, 1)

print(f"Ecuación de la recta calculada en Python: Y = {m:.2f}X + ({b:.2f})")
print(f"Pendiente (m): {m:.4f}")
print(f"Intercepto (b): {b:.4f}")

valores_y_pred = m * metros_cuadrados + b

plt.figure(figsize=(8, 5))
plt.scatter(metros_cuadrados, precio_venta, color='blue', label='Datos Reales (Propiedades)', s=100, zorder=5)
plt.plot(metros_cuadrados, valores_y_pred, color='red', linestyle='--', linewidth=2,
label=f'Recta de Regresión: Y = {m:.2f}X + ({b:.2f})')

plt.title('Relación entre Metros Cuadrados y Precio de Venta', fontsize=14, pad=15)
plt.xlabel('Metros Cuadrados ($m^2$)', fontsize=12)
plt.ylabel('Precio de Venta (en miles $)', fontsize=12)
plt.grid(True, linestyle='--', alpha=0.6)
plt.legend(fontsize=11)
plt.xlim(40, 200)
plt.ylim(100, 450)

plt.show()