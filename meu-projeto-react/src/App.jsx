import { useState } from 'react';
import './App.css'; 


function Contador() {
    const [count, setCount] = useState(100);
    const getcorVida = (count) => {
      if (count > 70) return "#00ff2aff";
      if (count <= 70 && count > 30) return "#e5ff00ff";
      else return "#ff0000ff";
    };
    return (
        <div>
            <h2 style={{ color: getcorVida(count) }}> VIDA: {count}</h2>
            <button onClick={() => setCount(count + 10)}>CURA(+10HP)</button>
            <button onClick={() => setCount(count - 15)}>DANO (-15HP)</button>
        </div>
    );
}

function SistemaXP() {
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);
    const xpParaProximoNivel = 300;


    const adicionarXp = (quantidade) => {
        const novoXpTotal = xp + quantidade;
        
        if (novoXpTotal >= xpParaProximoNivel) {
            const niveisGanhos = Math.floor(novoXpTotal / xpParaProximoNivel);
            const xpRestante = novoXpTotal % xpParaProximoNivel;
            setLevel(level + niveisGanhos);
            setXp(xpRestante);
        } else {
            setXp(novoXpTotal);
        }
    };


    const progresso = (xp / xpParaProximoNivel) * 100;


    return (
        <div style={{ padding: "20px" }}>
            <h2>Nível: {level}</h2>
            <p>Experiência: {xp} / {xpParaProximoNivel} XP</p>
            <div style={{
                width: "250px",
                height: "25px",
                backgroundColor: "#333",
                borderRadius: "15px",
                overflow: "hidden"
            }}>
                <div style={{
                    width: `${progresso}%`,
                    height: "100%",
                    backgroundColor: "#3498db",
                    transition: "width 0.5s ease-in-out",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold"
                }}>
                   {progresso.toFixed(0)}%
                </div>
            </div>
            <div style={{marginTop: "10px"}}>
                <button onClick={() => adicionarXp(100)}>Completar missão (+100 XP)</button>
                <button onClick={() => adicionarXp(50)}>Derrotar inimigo (+50 XP)</button>
            </div>
        </div>
    );
}

function InventarioAventureiro() {
 
  const [estaAberto, setEstaAberto] = useState(false);
  const itensInventario = [
    '⚔️ Espada de Ferro',
    '🛡️ Escudo de Madeira',
    '🧪 Poção de Cura (P)',
    '🗺️ Mapa da Dungeon',
    '💰 15 Moedas de Ouro'
  ];

  const alternarInventario = () => {
    setEstaAberto(!estaAberto); 
  };

  return (
    <div className="inventario-container">
      
      <h3>Inventário do Aventureiro</h3>
      
      {

      }
      <button onClick={alternarInventario} className="botao-inventario">
        {estaAberto ? 'Fechar Inventário' : 'Abrir Inventário'}
      </button>
      
      <hr />

      {
      }
      {estaAberto ? (
        <div className="lista-itens">
          <h4>Itens na Mochila:</h4>
          <ul>
            {itensInventario.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mochila-fechada">
          <span title="Inventário Fechado">🎒</span>
          <p>(Inventário Fechado)</p>
        </div>
      )}
    </div>
  );
}

let idInicial = 0;

function DiarioDeMissoes() {
  const [textoNovaMissao, setTextoNovaMissao] = useState('');
  const [categoriaNovaMissao, setCategoriaNovaMissao] = useState('Secundária');
  const [missoes, setMissoes] = useState([
    { id: idInicial++, texto: 'Faça contato visual', categoria: 'Principal', concluida: false },
    { id: idInicial++, texto: 'Aja confiante', categoria: 'Secundária', concluida: false },
    { id: idInicial++, texto: 'Pegue o instagram', categoria: 'Urgente', concluida: true },
    { id: idInicial++, texto: 'NAO CHAME PARA COMER SUSHI', categoria: 'Urgente', concluida: true },
  ]);

  const adicionarMissao = (evento) => {
    evento.preventDefault(); 
    
    if (textoNovaMissao.trim() === '') return; 

    const novaMissao = {
      id: idInicial++,
      texto: textoNovaMissao,
      categoria: categoriaNovaMissao,
      concluida: false
    };

    setMissoes([...missoes, novaMissao]);
    setTextoNovaMissao('');
    setCategoriaNovaMissao('Secundária');
  };

  const alternarConclusao = (idDaMissao) => {
    setMissoes(missoes.map(missao => {
      if (missao.id === idDaMissao) {
        return { ...missao, concluida: !missao.concluida };
      }
      return missao; 
    }));
  };
  
  const missoesCompletasContador = missoes.filter(m => m.concluida).length;

  return (
    <div className="diario-container">
      <h2>📜 Diário de Missões</h2>

      <form onSubmit={adicionarMissao} className="form-nova-missao">
        <div className="input-grupo">
          <input
            type="text"
            value={textoNovaMissao}
            onChange={(e) => setTextoNovaMissao(e.target.value)}
            placeholder="Nova missão..."
          />
          <select
            value={categoriaNovaMissao}
            onChange={(e) => setCategoriaNovaMissao(e.target.value)}
          >
            <option value="Principal">   Principal</option>
            <option value="Secundária">  Secundária</option>
            <option value="Urgente">  Urgente</option>
          </select>
        </div>
        <button type="submit">Adicionar</button>
      </form>

      <div className="lista-missoes">
        <h3>Missões Ativas ({missoes.length - missoesCompletasContador})</h3>
        
        {missoes.length === 0 && (
          <p className="sem-missoes">Nenhuma missão ativa. Adicione uma!</p>
        )}

        <ul>
          {missoes.map(missao => (
            <li 
              key={missao.id} 
              className={`
                item-missao 
                ${missao.concluida ? 'concluida' : ''}
                categoria-${missao.categoria.toLowerCase()}
              `}
            >
              <input 
                type="checkbox"
                checked={missao.concluida}
                onChange={() => alternarConclusao(missao.id)}
              />
              
              <span className="texto-missao">
                {missao.texto}
                {' '}
                <span className="categoria-tag">{missao.categoria}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="rodape-diario">
        <strong>Missões Completas: {missoesCompletasContador}</strong>
      </div>
    </div>
  );
}

// 5 - Gerador de Encantamentos
function GeradorEncantamentos() {
  const [palavraBase, setPalavraBase] = useState('');
  const [encantamento, setEncantamento] = useState('');

  const prefixos = ['Ignis', 'Aqua', 'Ventus', 'Terra', 'Lumen', 'Nox', 'Mortis', 'Vita'];
  const sufixos = ['Maximus', 'Eternus', 'Revelio', 'Arcanum', 'Infinitus', 'Antiqua'];

  const gerarEncantamento = () => {
    if (palavraBase.trim() === '') {
      setEncantamento(''); 
      return;
    }
    
    const baseInvertida = palavraBase
      .split('')
      .reverse()
      .join('');

    const prefixoAleatorio = prefixos[Math.floor(Math.random() * prefixos.length)];
    const sufixoAleatorio = sufixos[Math.floor(Math.random() * sufixos.length)];

    const encantamentoFinal = `${prefixoAleatorio} ${baseInvertida.toUpperCase()} ${sufixoAleatorio}!`;

    setEncantamento(encantamentoFinal);
  };

  const handleGerarClick = () => {
    gerarEncantamento();
  };
  
  const handleInputChange = (e) => {
    setPalavraBase(e.target.value);
  };

  return (
    <div>
      
      <h2> Gerador de Encantamentos</h2>
      
      <div>
        <label htmlFor="palavraBase">Palavra Mágica Base:</label>
        <br />
        <input
          id="palavraBase"
          type="text"
          value={palavraBase}
          onChange={handleInputChange}
          placeholder="Ex: Fogo, Aqua, Lux"
        />
      </div>

      <button onClick={handleGerarClick}>
        Gerar Encantamento
      </button>

      {encantamento && (
        <div>
          <h3>Encantamento Gerado:</h3>
          <p>
            {encantamento}
          </p>
        </div>
      )}

    </div>
  );
}

// 6 - Ranking dos Heróis
function RankingDosHerois() {
  const [heroes, setHeroes] = useState([
    { id: 1, nome: 'Tannuz', nivel: 8, classe: 'Mago' },
    { id: 2, nome: 'CAIOX', nivel: 10, classe: 'Arqueiro' },
    { id: 3, nome: 'Tiago', nivel: 7, classe: 'Guerreiro' },
  ]);
  
  const [novoNome, setNovoNome] = useState('');
  const [novoNivel, setNovoNivel] = useState(1);
  const [novaClasse, setNovaClasse] = useState('Guerreiro');

  const classEmojis = {
    Guerreiro: '⚔️',
    Mago: '🧙',
    Arqueiro: '🏹',
  };

  const adicionarHeroi = (e) => {
    e.preventDefault();
    if (novoNome.trim() === '') return;
    
    const novoHeroi = {
      id: Date.now(),
      nome: novoNome,
      nivel: parseInt(novoNivel, 10),
      classe: novaClasse,
    };
    
    setHeroes([...heroes, novoHeroi]);
    setNovoNome('');
    setNovoNivel(1);
  };

  const editarNivel = (id, novoNivel) => {
    setHeroes(heroes.map(heroi =>
      heroi.id === id
        ? { ...heroi, nivel: parseInt(novoNivel, 10) || 0 }
        : heroi
    ));
  };
  
  const removerHeroi = (id) => {
    setHeroes(heroes.filter(heroi => heroi.id !== id));
  };

  const ranking = [...heroes].sort((a, b) => b.nivel - a.nivel);

  return (
    <div>
      <h2> Party dos Heróis</h2>

      <form onSubmit={adicionarHeroi}>
        <input
          type="text"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Nome do Companheiro"
        />
        <div>
          <input
            type="number"
            value={novoNivel}
            onChange={(e) => setNovoNivel(e.target.value)}
            min="1"
          />
          <select
            value={novaClasse}
            onChange={(e) => setNovaClasse(e.target.value)}
          >
            <option value="Guerreiro">Guerreiro</option>
            <option value="Mago">Mago</option>
            <option value="Arqueiro">Arqueiro</option>
          </select>
        </div>
        <button type="submit">
          Adicionar à Party
        </button>
      </form>

      <h3>Party Atual ({heroes.length})</h3>
      <ol>
        {ranking.map((heroi) => (
          <li key={heroi.id}>
            
            <div>
              <span>{classEmojis[heroi.classe]}</span>
              <div>
                <strong>{heroi.nome}</strong>
                <br />
                <span>{heroi.classe}</span>
              </div>
            </div>
            
            <div>
              <label>
                Nvl:
                <input
                  type="number"
                  value={heroi.nivel}
                  onChange={(e) => editarNivel(heroi.id, e.target.value)}
                  min="0"
                />
              </label>
              <button onClick={() => removerHeroi(heroi.id)}>
                X
              </button>
            </div>
            
          </li>
        ))}
      </ol>
    </div>
  );
}

// 7 - Sistema de Atributos
function SistemaDeAtributos() {
  const [pontos, setPontos] = useState(10);
  const [atributos, setAtributos] = useState({
    forca: 0,
    resistencia: 0,
    inteligencia: 0,
    sorte: 0,
  });

  const alterarAtributo = (atributo, valor) => {
    const valorAtual = atributos[atributo];
    
    if (valor > 0) {
      if (pontos > 0) {
        setPontos(pontos - 1);
        setAtributos({ ...atributos, [atributo]: valorAtual + 1 });
      }
    } else if (valor < 0) {
      if (valorAtual > 0) {
        setPontos(pontos + 1);
        setAtributos({ ...atributos, [atributo]: valorAtual - 1 });
      }
    }
  };

  const dano = 5 + atributos.forca * 2;
  const vida = 100 + atributos.resistencia * 10;
  const mana = 50 + atributos.inteligencia * 5;
  const criticos = 1 + atributos.sorte;

  return (
    <div>
      <h2>Sistema de Atributos</h2>
      
      <div>
        Pontos para Distribuir: <strong>{pontos}</strong>
      </div>

      <div>
        <div>
          <span>💪 Força</span>
          <button onClick={() => alterarAtributo('forca', -1)} disabled={atributos.forca === 0}>-</button>
          <span>{atributos.forca}</span>
          <button onClick={() => alterarAtributo('forca', 1)} disabled={pontos === 0}>+</button>
        </div>
        
        <div>
          <span>🛡️ Resistência</span>
          <button onClick={() => alterarAtributo('resistencia', -1)} disabled={atributos.resistencia === 0}>-</button>
          <span>{atributos.resistencia}</span>
          <button onClick={() => alterarAtributo('resistencia', 1)} disabled={pontos === 0}>+</button>
        </div>
        
        <div>
          <span>🧠 Inteligência</span>
          <button onClick={() => alterarAtributo('inteligencia', -1)} disabled={atributos.inteligencia === 0}>-</button>
          <span>{atributos.inteligencia}</span>
          <button onClick={() => alterarAtributo('inteligencia', 1)} disabled={pontos === 0}>+</button>
        </div>
        
        <div>
          <span>🍀 Sorte</span>
          <button onClick={() => alterarAtributo('sorte', -1)} disabled={atributos.sorte === 0}>-</button>
          <span>{atributos.sorte}</span>
          <button onClick={() => alterarAtributo('sorte', 1)} disabled={pontos === 0}>+</button>
        </div>
      </div>

      <hr />

      <h3>Status Derivados</h3>
      <div>
        <span><strong>Dano:</strong> {dano}</span>
        <span><strong>Vida:</strong> {vida}</span>
        <span><strong>Mana:</strong> {mana}</span>
        <span><strong>Crítico:</strong> {criticos}%</span>
      </div>
    </div>
  );
}

// 8 - Painel do Personagem
function PainelDoPersonagem() {
  const [nome, setNome] = useState('Aventureiro');
  const [raca, setRaca] = useState('Humano');
  const [classe, setClasse] = useState('Guerreiro');
  const [mostrarEfeitos, setMostrarEfeitos] = useState(false);

  const statusEffects = [
    { id: 1, nome: '🔥 Bênção de Fogo', duracao: '5 min' },
    { id: 2, nome: '❄️ Lentidão', duracao: '30 seg' },
  ];

  return (
    <div>
      <h2>Painel: {nome}</h2>

      <div>
        <label htmlFor="nomePersonagem">Nome do Personagem: </label>
        <input
          id="nomePersonagem"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Digite seu nome..."
        />
      </div>
      
      <div>
        <label htmlFor="racaSelect">Raça: </label>
        <select id="racaSelect" value={raca} onChange={(e) => setRaca(e.target.value)}>
          <option value="Humano">Humano</option>
          <option value="Elfo">Elfo</option>
          <option value="Anão">Anão</option>
          <option value="Orc">Orc</option>
        </select>
      </div>

      <div>
        <label htmlFor="classeSelect">Classe: </label>
        <select id="classeSelect" value={classe} onChange={(e) => setClasse(e.target.value)}>
          <option value="Guerreiro">Guerreiro</option>
          <option value="Mago">Mago</option>
          <option value="Arqueiro">Arqueiro</option>
          <option value="Ladino">Ladino</option>
        </select>
      </div>

      <hr />

      <button onClick={() => setMostrarEfeitos(!mostrarEfeitos)}>
        {mostrarEfeitos ? 'Esconder Efeitos' : 'Mostrar Efeitos Ativos'} ({statusEffects.length})
      </button>

      {mostrarEfeitos && (
        <div>
          <strong>Efeitos Ativos:</strong>
          <ul>
            {statusEffects.map(effect => (
              <li key={effect.id}>
                {effect.nome} ({effect.duracao})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// 9 - Sistema Econômico
function SistemaEconomico() {
  const [ouro, setOuro] = useState(50);
  const [mostrarLoja, setMostrarLoja] = useState(false);

  const lojaItens = [
    { id: 1, nome: '🧪 Poção de Cura (P)', preco: 15 },
    { id: 2, nome: '🗡️ Adaga de Ferro', preco: 40 },
    { id: 3, nome: '🍞 Pão de Viagem', preco: 5 },
  ];

  const comprarItem = (preco) => {
    if (ouro >= preco) {
      setOuro(ouro - preco);
      alert('Item comprado com sucesso!');
    } else {
      alert('Ouro insuficiente!');
    }
  };

  return (
    <div>
      <h2>💰 Sistema Econômico</h2>
      
      <div>
        Ouro: {ouro} moedas
      </div>

      <div>
        <button onClick={() => setOuro(ouro + 25)}>
          +25 Ouro (Missão)
        </button>
        <button onClick={() => comprarItem(15)}>
          -15 Ouro (Item)
        </button>
      </div>

      <hr />

      <button onClick={() => setMostrarLoja(!mostrarLoja)}>
        {mostrarLoja ? 'Fechar Loja' : 'Abrir Loja'}
      </button>

      {mostrarLoja && (
        <div>
          <strong>Itens à Venda:</strong>
          <ul>
            {lojaItens.map(item => (
              <li key={item.id}>
                <span>{item.nome} - <strong>{item.preco}g</strong></span>
                <button onClick={() => comprarItem(item.preco)} disabled={ouro < item.preco}>
                  Comprar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


function Myapp() {
  return (
    <>
      <Contador />
      <InventarioAventureiro/>
      <SistemaXP />
      <DiarioDeMissoes/>
      <GeradorEncantamentos/>
      <RankingDosHerois/>
      <SistemaDeAtributos/>
      <PainelDoPersonagem />
      <SistemaEconomico />
    </>
  )
}

export default Myapp;