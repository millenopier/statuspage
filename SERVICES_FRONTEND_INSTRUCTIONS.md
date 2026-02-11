# Atualizar Services.jsx

## 1. Adicionar import no topo:
```javascript
import { getServices, createService, updateService, deleteService, toggleServiceVisibility } from '../services/api';
```

## 2. Adicionar is_visible no formData (linha ~11):
```javascript
const [formData, setFormData] = useState({
  name: '',
  description: '',
  status: 'operational',
  position: 0,
  url: '',
  heartbeat_interval: 60,
  request_timeout: 120,
  retries: 5,
  is_visible: true,  // ADICIONAR ESTA LINHA
});
```

## 3. Adicionar função handleToggleVisibility (após handleDelete):
```javascript
const handleToggleVisibility = async (service) => {
  try {
    await toggleServiceVisibility(service.id, !service.is_visible);
    fetchServices();
  } catch (error) {
    console.error('Error toggling visibility:', error);
    alert('Error toggling visibility');
  }
};
```

## 4. Atualizar resetForm (linha ~67):
```javascript
const resetForm = () => {
  setFormData({ 
    name: '', 
    description: '', 
    status: 'operational', 
    position: 0, 
    url: '', 
    heartbeat_interval: 60, 
    request_timeout: 120, 
    retries: 5,
    is_visible: true  // ADICIONAR
  });
  setEditingService(null);
  setShowForm(false);
};
```

## 5. Adicionar indicador visual de visibilidade (após o status badge, linha ~195):
```javascript
<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ml-2 ${
  service.is_visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
}`}>
  {service.is_visible ? '👁️ Visible' : '🚫 Hidden'}
</span>
```

## 6. Adicionar botão Hide/Show (antes dos botões Edit e Delete, linha ~200):
```javascript
<button
  onClick={() => handleToggleVisibility(service)}
  className={`px-3 py-1 rounded ${service.is_visible ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
>
  {service.is_visible ? 'Hide' : 'Show'}
</button>
```

Resultado final dos botões:
```javascript
<div className="flex gap-2">
  <button
    onClick={() => handleToggleVisibility(service)}
    className={`px-3 py-1 rounded ${service.is_visible ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
  >
    {service.is_visible ? 'Hide' : 'Show'}
  </button>
  <button
    onClick={() => handleEdit(service)}
    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
  >
    Edit
  </button>
  <button
    onClick={() => handleDelete(service.id)}
    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
  >
    Delete
  </button>
</div>
```
