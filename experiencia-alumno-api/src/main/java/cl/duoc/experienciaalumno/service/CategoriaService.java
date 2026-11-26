package cl.duoc.experienciaalumno.service;

import cl.duoc.experienciaalumno.dto.FinanzasDto.CategoriaRequest;
import cl.duoc.experienciaalumno.dto.FinanzasDto.CategoriaResponse;
import cl.duoc.experienciaalumno.exception.ApiExceptions.ConflictoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.RecursoNoEncontradoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.ReglaNegocioException;
import cl.duoc.experienciaalumno.model.Categoria;
import cl.duoc.experienciaalumno.repository.CategoriaRepository;
import cl.duoc.experienciaalumno.repository.CuotaRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final CuotaRepository cuotaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository, CuotaRepository cuotaRepository) {
        this.categoriaRepository = categoriaRepository;
        this.cuotaRepository = cuotaRepository;
    }

    public List<CategoriaResponse> listar() {
        return categoriaRepository.findAll(Sort.by("nombre")).stream().map(CategoriaResponse::from).toList();
    }

    public CategoriaResponse obtener(Long id) {
        return CategoriaResponse.from(buscar(id));
    }

    @Transactional
    public CategoriaResponse crear(CategoriaRequest req) {
        if (categoriaRepository.existsByNombreIgnoreCase(req.nombre().trim())) {
            throw new ConflictoException("Ya existe la categoría " + req.nombre());
        }
        return CategoriaResponse.from(categoriaRepository.save(new Categoria(req.nombre().trim(), req.descripcion())));
    }

    @Transactional
    public CategoriaResponse actualizar(Long id, CategoriaRequest req) {
        Categoria categoria = buscar(id);
        String nombre = req.nombre().trim();
        if (!categoria.getNombre().equalsIgnoreCase(nombre) && categoriaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new ConflictoException("Ya existe la categoría " + nombre);
        }
        categoria.setNombre(nombre);
        categoria.setDescripcion(req.descripcion());
        return CategoriaResponse.from(categoria);
    }

    @Transactional
    public void eliminar(Long id) {
        Categoria categoria = buscar(id);
        if (cuotaRepository.existsByCategoriaId(id)) {
            throw new ReglaNegocioException("No se puede eliminar: la categoría tiene cuotas asociadas");
        }
        categoriaRepository.delete(categoria);
    }

    private Categoria buscar(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría " + id + " no encontrada"));
    }
}
