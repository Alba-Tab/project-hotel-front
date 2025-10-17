# Backend Django - Configuración para Check-In/Check-Out

## 1. Modelo (models.py)

```python
from django.db import models
from apps.reservas.models import Reserva

class CheckInOut(models.Model):
    reserva = models.OneToOneField(
        Reserva,
        on_delete=models.CASCADE,
        related_name="checkinout"
    )
    fecha_checkin = models.DateField()
    hora_checkin = models.TimeField()
    fecha_checkout = models.DateField(null=True, blank=True)
    hora_checkout = models.TimeField(null=True, blank=True)
    observaciones = models.TextField(blank=True, null=True)

    # Campos de auditoría (opcional)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "check_in_out"
        ordering = ["-fecha_checkin"]
        verbose_name = "Check-In/Check-Out"
        verbose_name_plural = "Check-Ins/Check-Outs"

    def __str__(self):
        return f"CheckInOut - Reserva #{self.reserva.id}"

    def clean(self):
        from django.core.exceptions import ValidationError

        # Validar que la reserva esté confirmada
        if self.reserva.estado.lower() != 'confirmada':
            raise ValidationError('Solo se puede hacer check-in a reservas confirmadas')

        # Validar que check-out sea posterior a check-in
        if self.fecha_checkout and self.fecha_checkin:
            if self.fecha_checkout < self.fecha_checkin:
                raise ValidationError('La fecha de check-out no puede ser anterior al check-in')

            if self.fecha_checkout == self.fecha_checkin and self.hora_checkout:
                if self.hora_checkout < self.hora_checkin:
                    raise ValidationError('La hora de check-out debe ser posterior al check-in')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
```

## 2. Serializer (serializers.py)

```python
from rest_framework import serializers
from .models import CheckInOut, Reserva

class CheckInOutSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckInOut
        fields = [
            'id',
            'reserva',
            'fecha_checkin',
            'hora_checkin',
            'fecha_checkout',
            'hora_checkout',
            'observaciones',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        reserva = data.get('reserva')

        # Validar que la reserva esté confirmada
        if reserva and reserva.estado.lower() != 'confirmada':
            raise serializers.ValidationError(
                "Solo se puede hacer check-in a reservas confirmadas"
            )

        # Validar que no exista ya un check-in para esta reserva (en caso de POST)
        if self.instance is None:  # Solo en creación
            if CheckInOut.objects.filter(reserva=reserva).exists():
                raise serializers.ValidationError(
                    "Esta reserva ya tiene un check-in registrado"
                )

        # Validar fechas de check-out
        fecha_checkout = data.get('fecha_checkout')
        fecha_checkin = data.get('fecha_checkin')

        if fecha_checkout and fecha_checkin:
            if fecha_checkout < fecha_checkin:
                raise serializers.ValidationError(
                    "La fecha de check-out no puede ser anterior al check-in"
                )

        return data

class ReservaSerializer(serializers.ModelSerializer):
    checkinout = CheckInOutSerializer(required=False, read_only=True)
    nombre_huesped = serializers.CharField(source='huesped.nombre', read_only=True)
    nro_habitacion = serializers.CharField(source='habitacion.numero', read_only=True)
    nombre_hotel = serializers.CharField(source='habitacion.hotel.nombre', read_only=True)

    class Meta:
        model = Reserva
        fields = [
            'id',
            'fecha_reserva',
            'fecha_entrada',
            'fecha_salida',
            'nombre_huesped',
            'nro_habitacion',
            'nombre_hotel',
            'total',
            'estado',
            'checkinout'
        ]
```

## 3. ViewSet (views.py)

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import CheckInOut, Reserva
from .serializers import CheckInOutSerializer, ReservaSerializer

class CheckInOutViewSet(viewsets.ModelViewSet):
    queryset = CheckInOut.objects.all()
    serializer_class = CheckInOutSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filtrar por tenant si es multi-tenant
        queryset = CheckInOut.objects.all()

        # Filtrar por reserva si se proporciona
        reserva_id = self.request.query_params.get('reserva', None)
        if reserva_id:
            queryset = queryset.filter(reserva_id=reserva_id)

        return queryset

    def create(self, request, *args, **kwargs):
        """Crear check-in"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        """Actualizar para agregar check-out"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()

            # Validar que ya existe un check-in
            if not instance.fecha_checkin:
                return Response(
                    {'detail': 'No se puede hacer check-out sin check-in'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validar que no se haya hecho check-out previamente
            if instance.fecha_checkout and not partial:
                return Response(
                    {'detail': 'Ya se realizó el check-out para esta reserva'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer = self.get_serializer(
                instance,
                data=request.data,
                partial=partial
            )
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """Obtener reservas pendientes de check-in"""
        reservas_confirmadas = Reserva.objects.filter(
            estado__iexact='confirmada',
            checkinout__isnull=True
        )
        serializer = ReservaSerializer(reservas_confirmadas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def activos(self, request):
        """Obtener check-ins activos (sin check-out)"""
        checkins_activos = CheckInOut.objects.filter(
            fecha_checkout__isnull=True
        )
        serializer = self.get_serializer(checkins_activos, many=True)
        return Response(serializer.data)

class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.all()
    serializer_class = ReservaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Reserva.objects.select_related(
            'huesped',
            'habitacion',
            'habitacion__hotel',
            'checkinout'
        ).all()

        # Filtros opcionales
        estado = self.request.query_params.get('estado', None)
        if estado:
            queryset = queryset.filter(estado__iexact=estado)

        return queryset
```

## 4. URLs (urls.py)

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CheckInOutViewSet, ReservaViewSet

router = DefaultRouter()
router.register(r'check-in-out', CheckInOutViewSet, basename='checkinout')
router.register(r'reservas', ReservaViewSet, basename='reservas')

urlpatterns = [
    path('', include(router.urls)),
]
```

## 5. Admin (admin.py) - Opcional

```python
from django.contrib import admin
from .models import CheckInOut

@admin.register(CheckInOut)
class CheckInOutAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'reserva',
        'fecha_checkin',
        'hora_checkin',
        'fecha_checkout',
        'hora_checkout',
        'created_at'
    ]
    list_filter = ['fecha_checkin', 'fecha_checkout']
    search_fields = ['reserva__id', 'observaciones']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Información de la Reserva', {
            'fields': ('reserva',)
        }),
        ('Check-In', {
            'fields': ('fecha_checkin', 'hora_checkin')
        }),
        ('Check-Out', {
            'fields': ('fecha_checkout', 'hora_checkout')
        }),
        ('Detalles', {
            'fields': ('observaciones',)
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
```

## 6. Migraciones

```bash
# Crear las migraciones
python manage.py makemigrations

# Aplicar las migraciones
python manage.py migrate
```

## 7. Permisos (permissions.py) - Opcional

```python
from rest_framework import permissions

class CanManageCheckInOut(permissions.BasePermission):
    """
    Permiso personalizado para gestionar check-in/check-out
    """

    def has_permission(self, request, view):
        # Solo usuarios autenticados
        if not request.user.is_authenticated:
            return False

        # Staff siempre tiene permiso
        if request.user.is_staff:
            return True

        # Verificar permisos específicos
        return request.user.has_perm('reservas.add_checkinout') or \
               request.user.has_perm('reservas.change_checkinout')

    def has_object_permission(self, request, view, obj):
        # Staff siempre tiene permiso
        if request.user.is_staff:
            return True

        # Verificar que el usuario pertenece al mismo hotel
        # (personalizar según tu modelo de negocio)
        return True
```

## 8. Tests (tests.py) - Opcional

```python
from django.test import TestCase
from django.utils import timezone
from .models import CheckInOut, Reserva
from datetime import date, time

class CheckInOutTestCase(TestCase):
    def setUp(self):
        # Crear una reserva de prueba
        self.reserva = Reserva.objects.create(
            fecha_reserva=date.today(),
            fecha_entrada=date.today(),
            fecha_salida=date.today(),
            estado='confirmada',
            # ... otros campos necesarios
        )

    def test_crear_checkin(self):
        """Test para crear un check-in"""
        checkin = CheckInOut.objects.create(
            reserva=self.reserva,
            fecha_checkin=date.today(),
            hora_checkin=time(14, 0)
        )
        self.assertEqual(checkin.reserva, self.reserva)
        self.assertIsNone(checkin.fecha_checkout)

    def test_no_duplicate_checkin(self):
        """Test que no se puedan crear múltiples check-ins para una reserva"""
        CheckInOut.objects.create(
            reserva=self.reserva,
            fecha_checkin=date.today(),
            hora_checkin=time(14, 0)
        )

        with self.assertRaises(Exception):
            CheckInOut.objects.create(
                reserva=self.reserva,
                fecha_checkin=date.today(),
                hora_checkin=time(15, 0)
            )
```

## Notas Importantes

1. **Relación OneToOne**: Asegúrate de que `related_name="checkinout"` esté configurado correctamente
2. **Estado de Reserva**: Valida que solo reservas confirmadas puedan tener check-in
3. **Timezone**: Considera usar timezone-aware datetimes si tu aplicación es multi-zona horaria
4. **Permisos**: Implementa permisos adecuados según tus necesidades
5. **Logs**: Considera agregar logging para auditoría de check-in/check-out
