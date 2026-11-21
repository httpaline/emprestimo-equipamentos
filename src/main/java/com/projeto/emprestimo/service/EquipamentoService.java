package com.projeto.emprestimo.service;

import com.projeto.emprestimo.model.Equipamento;
import com.projeto.emprestimo.model.TipoEquipamento;
import com.projeto.emprestimo.repository.EmprestimoRepository;
import com.projeto.emprestimo.repository.EquipamentoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class EquipamentoService {
    private final EquipamentoRepository equipamentoRepository;
    private final EmprestimoRepository emprestimoRepository;

    public EquipamentoService(EquipamentoRepository equipamentoRepository, EmprestimoRepository emprestimoRepository){
        this.equipamentoRepository = equipamentoRepository;
        this.emprestimoRepository = emprestimoRepository;
    }

    public List<Equipamento> listar(TipoEquipamento tipo){
        if(tipo == null){
            return equipamentoRepository.findAll();
        }
        return equipamentoRepository.findByTipo(tipo);
    }

    public Equipamento buscar(Long id){
        return equipamentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipamento não encontrado."));
    }

    public Equipamento cadastrar(Equipamento equipamento){
        if(equipamentoRepository.existsByPatrimonio(equipamento.getPatrimonio())){
            throw new IllegalStateException("Já existe um equipamento com o patrimônio " + equipamento.getPatrimonio());
        }
        equipamento.setDisponivel(true);
        return equipamentoRepository.save(equipamento);
    }

    public Equipamento atualizar(Long id, Equipamento dados) {
        Equipamento equipamento = buscar(id);

        equipamento.setNome(dados.getNome());
        equipamento.setTipo(dados.getTipo());

        return equipamentoRepository.save(equipamento);
    }

    public void remover(Long id){
        Equipamento equipamento = buscar(id);

        if(emprestimoRepository.existsByEquipamentoId(id)){
            throw new IllegalStateException("O equipamento " + equipamento.getPatrimonio() + " possui empréstimos registrados e não pode ser removido.");
        }

        equipamentoRepository.delete(equipamento);
    }

}
