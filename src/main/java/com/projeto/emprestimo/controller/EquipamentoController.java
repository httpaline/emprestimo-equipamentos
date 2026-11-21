package com.projeto.emprestimo.controller;


import com.projeto.emprestimo.model.Equipamento;
import com.projeto.emprestimo.model.TipoEquipamento;
import com.projeto.emprestimo.service.EquipamentoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/equipamentos")
public class EquipamentoController {
    private final EquipamentoService equipamentoService;

    public EquipamentoController(EquipamentoService equipamentoService) {
        this.equipamentoService = equipamentoService;
    }

    @GetMapping
    public List<Equipamento> listar(@RequestParam(required = false) TipoEquipamento tipo){
        return equipamentoService.listar(tipo);
    }

    @GetMapping("/{id}")
    public Equipamento buscar(@PathVariable Long id){
        return equipamentoService.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Equipamento cadastrar(@RequestBody Equipamento equipamento){
        return equipamentoService.cadastrar(equipamento);
    }

    @PutMapping("/{id}")
    public Equipamento atualizar(@PathVariable Long id, @RequestBody Equipamento dados){
        return equipamentoService.atualizar(id, dados);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Long id){
        equipamentoService.remover(id);
    }


}
