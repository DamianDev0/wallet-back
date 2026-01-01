# Guía Completa de Integración Belvo

## Flujo de Integración Customer + Belvo

Esta guía explica el flujo completo desde el registro del customer hasta la obtención de datos financieros.

---

## Arquitectura

```
┌─────────────────┐
│  React Native   │
│   Mobile App    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│         Backend API                 │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  CustomerFinancialModule     │  │
│  │  - Widget Token              │  │
│  │  - Link Management           │  │
│  │  - Financial Data            │  │
│  └──────────┬───────────────────┘  │
│             │                       │
│  ┌──────────▼───────────────────┐  │
│  │     BelvoModule              │  │
│  │  - BelvoWidgetService        │  │
│  │  - BelvoLinksService         │  │
│  │  - BelvoAccountsService      │  │
│  │  - BelvoTransactionsService  │  │
│  └──────────┬───────────────────┘  │
└─────────────┼───────────────────────┘
              │
              ▼
      ┌──────────────┐
      │  Belvo API   │
      └──────────────┘
```

---

## Flujo Paso a Paso

### 1. Registro del Customer

```http
POST /auth/customer/signup
Content-Type: application/json

{
  "fullName": "Juan Pérez",
  "email": "juan@example.com",
  "password": "SecurePassword123"
}

Response:
{
  "customer": {
    "id": "uuid-customer-id",
    "fullName": "Juan Pérez",
    "email": "juan@example.com",
    "isActive": true,
    "belvoActive": false,
    "belvoLinkId": null
  },
  "token": "jwt-token-here"
}
```

### 2. Obtener Widget Token

El customer inicia sesión y quiere conectar su banco.

```http
POST /customers/{customerId}/financial/widget/token
Authorization: Bearer {jwt-token}

Response:
{
  "access_token": "belvo-widget-access-token",
  "customer_id": "uuid-customer-id",
  "external_id": "uuid-customer-id"
}
```

### 3. Abrir Belvo Widget en React Native

```typescript
import BelvoWidget from '@belvo-io/belvo-widget-react-native';

// Paso 1: Obtener token
const getWidgetToken = async () => {
  const response = await fetch(
    `${API_URL}/customers/${customerId}/financial/widget/token`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();
  return data.access_token;
};

// Paso 2: Mostrar widget
const ConnectBankScreen = () => {
  const [widgetToken, setWidgetToken] = useState(null);
  const [showWidget, setShowWidget] = useState(false);

  const handleConnectBank = async () => {
    const token = await getWidgetToken();
    setWidgetToken(token);
    setShowWidget(true);
  };

  const handleSuccess = async (linkId: string) => {
    // Paso 3: Guardar link_id en el backend
    await fetch(
      `${API_URL}/customers/${customerId}/financial/link`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ link_id: linkId }),
      }
    );

    setShowWidget(false);
    Alert.alert('Éxito', '¡Banco conectado correctamente!');
  };

  const handleExit = () => {
    setShowWidget(false);
  };

  return (
    <View>
      {!showWidget && (
        <Button title="Conectar Banco" onPress={handleConnectBank} />
      )}

      {showWidget && widgetToken && (
        <BelvoWidget
          accessToken={widgetToken}
          onSuccess={handleSuccess}
          onExit={handleExit}
          onError={(error) => {
            console.error('Widget error:', error);
            setShowWidget(false);
          }}
        />
      )}
    </View>
  );
};
```

### 4. Vincular Banco (Backend guarda link_id)

```http
POST /customers/{customerId}/financial/link
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "link_id": "link-id-from-widget"
}

Response:
{
  "success": true,
  "message": "Bank account linked successfully",
  "data": {
    "customer_id": "uuid-customer-id",
    "link_id": "link-id-from-widget",
    "linked_at": "2024-01-15T10:30:00Z",
    "institution": "santander_mx",
    "status": "valid"
  }
}
```

### 5. Verificar Estado del Link

```http
GET /customers/{customerId}/financial/status
Authorization: Bearer {jwt-token}

Response:
{
  "is_linked": true,
  "link_id": "link-id-here",
  "linked_at": "2024-01-15T10:30:00Z",
  "active": true,
  "institution": "santander_mx",
  "status": "valid",
  "access_mode": "single"
}
```

### 6. Obtener Datos Financieros

#### 6.1 Obtener Cuentas

```http
GET /customers/{customerId}/financial/accounts
Authorization: Bearer {jwt-token}

Response:
[
  {
    "id": "account-id-1",
    "name": "Cuenta de Ahorros",
    "type": "savings",
    "balance": {
      "current": 50000.00,
      "available": 48000.00
    },
    "currency": "MXN",
    "number": "****1234"
  }
]
```

#### 6.2 Obtener Transacciones

```http
GET /customers/{customerId}/financial/transactions?date_from=2024-01-01&date_to=2024-01-31
Authorization: Bearer {jwt-token}

Response:
[
  {
    "id": "transaction-id-1",
    "amount": -500.00,
    "description": "Compra en Starbucks",
    "value_date": "2024-01-15",
    "type": "OUTFLOW",
    "category": "Food & Dining",
    "merchant": {
      "name": "Starbucks"
    }
  }
]
```

#### 6.3 Obtener Balances

```http
GET /customers/{customerId}/financial/balances
Authorization: Bearer {jwt-token}

Response:
[
  {
    "id": "balance-id-1",
    "account": {
      "id": "account-id-1",
      "name": "Cuenta de Ahorros"
    },
    "balance": 50000.00,
    "current_balance": 50000.00,
    "available_balance": 48000.00,
    "currency": "MXN"
  }
]
```

#### 6.4 Obtener Resumen Completo

```http
GET /customers/{customerId}/financial/summary
Authorization: Bearer {jwt-token}

Response:
{
  "customer": {
    "id": "uuid-customer-id",
    "full_name": "Juan Pérez",
    "email": "juan@example.com"
  },
  "link_info": {
    "link_id": "link-id-here",
    "institution": "santander_mx",
    "linked_at": "2024-01-15T10:30:00Z",
    "status": "valid"
  },
  "accounts": [...],
  "transactions": [...],
  "balances": [...],
  "summary": {
    "total_accounts": 2,
    "total_transactions": 150,
    "total_balance": 75000.00,
    "available_balance": 72000.00,
    "currency": "MXN"
  }
}
```

### 7. Desvincular Banco

```http
DELETE /customers/{customerId}/financial/unlink
Authorization: Bearer {jwt-token}

Response:
{
  "success": true,
  "message": "Bank account unlinked successfully"
}
```

---

## API Endpoints Completos

### Customer Financial Endpoints

| Method | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/customers/:customerId/financial/widget/token` | Obtener token del widget |
| POST | `/customers/:customerId/financial/link` | Vincular cuenta bancaria |
| DELETE | `/customers/:customerId/financial/unlink` | Desvincular cuenta bancaria |
| GET | `/customers/:customerId/financial/status` | Estado del link |
| GET | `/customers/:customerId/financial/accounts` | Obtener cuentas |
| GET | `/customers/:customerId/financial/transactions` | Obtener transacciones |
| GET | `/customers/:customerId/financial/balances` | Obtener balances |
| GET | `/customers/:customerId/financial/summary` | Resumen completo |

### Belvo Direct Endpoints (Opcionales)

| Method | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/belvo/widget/token` | Token de widget sin customer |
| GET | `/belvo/links` | Listar todos los links |
| GET | `/belvo/links/:linkId` | Obtener link específico |
| POST | `/belvo/accounts/retrieve` | Recuperar cuentas |
| POST | `/belvo/transactions/retrieve` | Recuperar transacciones |
| GET | `/belvo/summary/:linkId` | Resumen por link |

---

## Ejemplo de Implementación en React Native

```typescript
// hooks/useBelvo.ts
import { useState } from 'react';
import { Alert } from 'react-native';

export const useBelvo = (customerId: string, authToken: string) => {
  const [loading, setLoading] = useState(false);
  const [widgetToken, setWidgetToken] = useState<string | null>(null);
  const [isLinked, setIsLinked] = useState(false);

  const API_URL = 'https://your-api.com';

  const getWidgetToken = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/customers/${customerId}/financial/widget/token`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      setWidgetToken(data.access_token);
      return data.access_token;
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener el token del widget');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const linkBankAccount = async (linkId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/customers/${customerId}/financial/link`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ link_id: linkId }),
        }
      );
      const data = await response.json();
      setIsLinked(true);
      return data;
    } catch (error) {
      Alert.alert('Error', 'No se pudo vincular la cuenta bancaria');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unlinkBankAccount = async () => {
    setLoading(true);
    try {
      await fetch(
        `${API_URL}/customers/${customerId}/financial/unlink`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );
      setIsLinked(false);
      Alert.alert('Éxito', 'Cuenta bancaria desvinculada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo desvincular la cuenta');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getFinancialSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/customers/${customerId}/financial/summary`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );
      return await response.json();
    } catch (error) {
      Alert.alert('Error', 'No se pudieron obtener los datos financieros');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    widgetToken,
    isLinked,
    getWidgetToken,
    linkBankAccount,
    unlinkBankAccount,
    getFinancialSummary,
  };
};
```

---

## Testing en Sandbox

Para probar en el ambiente sandbox de Belvo, usa estas credenciales:

- **Usuario**: `test`
- **Contraseña**: `test`

---

## Seguridad

1. **Variables de entorno protegidas**: Las API keys de Belvo nunca se exponen al frontend
2. **JWT Authentication**: Todos los endpoints requieren autenticación
3. **Validación de external_id**: El link_id debe coincidir con el customer_id
4. **Customer verification**: Se valida que el customer esté activo antes de crear tokens

---

## Base de Datos

Las nuevas columnas agregadas a la tabla `customers`:

```sql
ALTER TABLE customers ADD COLUMN belvo_link_id VARCHAR(255) NULL;
ALTER TABLE customers ADD COLUMN belvo_linked_at TIMESTAMP NULL;
ALTER TABLE customers ADD COLUMN belvo_active BOOLEAN DEFAULT FALSE;
```

---

## Próximos Pasos

1. Ejecutar migración de base de datos
2. Probar el flujo completo end-to-end
3. Implementar webhooks de Belvo para actualizaciones automáticas
4. Agregar caché para datos financieros
5. Implementar sincronización programada de transacciones
