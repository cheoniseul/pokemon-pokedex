/**
 * PokeAPI 통신 전용 모듈
 * UI / DOM 조작 없음
 */

const API_BASE = "https://pokeapi.co/api/v2";

/* 공통 요청 함수 */
async function request(url, errorMessage) {
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(errorMessage);
    }

    return await res.json();
}

/* 포켓몬 목록 */
export function fetchPokemonList(limit = 60, offset = 0) {
    return request(
        `${API_BASE}/pokemon?limit=${limit}&offset=${offset}`,
        "포켓몬 목록 로드 실패"
    );
}

/* 포켓몬 상세 */
export function fetchPokemonDetail(url) {
    return request(
        url,
        "포켓몬 상세 로드 실패"
    );
}

/* 포켓몬 종(species) - 한글 이름, 설명용 */
export function fetchPokemonSpecies(idOrUrl) {
  const url =
    typeof idOrUrl === "string"
      ? idOrUrl
      : `${API_BASE}/pokemon-species/${idOrUrl}`;

  return request(url, "포켓몬 종 정보 로드 실패");
}
