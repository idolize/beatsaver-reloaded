import React, { FunctionComponent, useEffect, useState } from 'react'
import { formatDate } from '../../utils/formatDate'
import { Statistic } from './Statistic'

interface IStatsProps {
  map: IMapStats
  uploaded: IBeatmap['uploaded']
  duration: IBeatmap['metadata']['duration']
}

interface IFullProps {
  map: IBeatmap
  uploaded?: undefined
  duration?: undefined
}

interface ICommonProps {
  hideTime?: boolean
}

type IProps = (IStatsProps | IFullProps) & ICommonProps
export const BeatmapStats: FunctionComponent<IProps> = ({
  map,
  uploaded: uploadedRaw,
  hideTime,
  duration: durationRaw,
}) => {
  const uploaded = isFullMap(map) ? map.uploaded : uploadedRaw
  if (uploaded === undefined) throw new Error('Uploaded cannot be null!')
  const duration = isFullMap(map) ? map.metadata.duration : durationRaw

  const [dateStr, setDateStr] = useState<string>(formatDate(uploaded))
  useEffect(() => {
    const i = setInterval(() => {
      const newStr = formatDate(uploaded)
      if (dateStr !== newStr) setDateStr(newStr)
    }, 1000 * 30)

    return () => clearInterval(i)
  }, [])

  return (
    <ul>
      <Statistic type='text' emoji='🔑' text={map.key} />

      {hideTime ? null : (
        <Statistic
          type='text'
          emoji='🕔'
          text={dateStr}
          hover={new Date(uploaded).toISOString()}
        />
      )}

      <Statistic
        type='num'
        emoji='💾'
        number={map.stats.downloads}
        hover='Downloads'
      />

      <Statistic
        type='num'
        emoji='👍'
        number={map.stats.upVotes}
        hover='Upvotes'
      />

      <Statistic
        type='num'
        emoji='👎'
        number={map.stats.downVotes}
        hover='Downvotes'
      />

      <Statistic
        type='num'
        emoji='💯'
        number={map.stats.rating}
        fixed={1}
        percentage={true}
        hover='Beatmap Rating'
      />

      {duration && duration > 0 ? (
        <Statistic
          type='text'
          emoji='⏱'
          text={convertSecondsToTime(duration)}
          hover='Beatmap Duration'
        />
      ) : null}

      {isFullMap(map) && map.metadata.requiresExternalAudioFile ? (
        <Statistic
          type='text'
          emoji='💿'
          text='BYOS'
          hover='Bring your own song file'
        />
      ) : null}
    </ul>
  )
}

// @ts-ignore
const isFullMap: (map: IMapStats | IBeatmap) => map is IBeatmap = map => {
  return (map as IBeatmap).downloadURL !== undefined
}

const convertSecondsToTime: (duration: number) => string = duration => {
  const hours = Math.trunc(duration / 3600)
  const minutes = Math.trunc((duration % 3600) / 60)
  const seconds = Math.trunc(duration % 60)

  const HH = hours.toString().padStart(2, '0')
  const MM = minutes.toString().padStart(2, '0')
  const SS = seconds.toString().padStart(2, '0')

  return hours > 0 ? `${HH}:${MM}:${SS}` : `${MM}:${SS}`
}
